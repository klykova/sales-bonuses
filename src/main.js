/**
 * Группировка массива по ключу
 * @param array - Массив данных
 * @param keyFn - Функция, которая определяет, по какому ключу будет происходить группировка
 * @returns {*}
 */
function groupBy(array, keyFn) {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}
// Группировка данных
const recordsBySeller = groupBy(data.purchase_records, record => record.seller_id);
const recordsByCustomer = groupBy(data.purchase_records, record => record.customer_id);
const recordsByProduct = groupBy(data.purchase_records.flatMap(record => record.items), item => item.sku);

console.log('###recordsBySeller###', recordsBySeller);
console.log('###recordsByCustomer###', recordsByCustomer);
console.log('###recordsByProduct###', recordsByProduct);



/**
 * Вычисление среднего значения
 * @param values
 * @param {number}
 */
 function calculateAverage(values) {
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length || 0;
 }
 



/**
 * Анализ последовательности чисел на устойчивость, возрастание и убывание,
 * Функция помогает проверять стабильность роста прибыли или выручки
 * @param sequence - массив чисел (последовательность)
 * @param tolerance  - допустимое относительное изменение между соседними элементами 
 * последовательности для того, чтобы считать ее стабильной (по умолчанию 0.05(5%))
 * @returns {{isIncreasing: boolean, isDecreasing: boolean, isStable: boolean}}
 */
function analyzeSequence(sequence, tolerance = 0.05) {
    const trends = {
        isStable: true,
        isIncreasing: false,
        isDecreasing: false,
    };

    if (sequence.length < 2) {
        return trends; // Для последовательностей длиной меньше 2 невозможно определить тренды
    }

    const start = sequence[0];
    const end = sequence[sequence.length - 1];
    const totalChange = end - start; // Общее изменение между первым и последним значением

    // Проверяем стабильность: каждое значение должно быть в пределах tolerance от предыдущего
    for (let i = 1; i < sequence.length; i++) {
        const relativeChange = Math.abs(sequence[i] - sequence[i - 1]) / Math.abs(sequence[i - 1]);
        if (relativeChange > tolerance) {
            trends.isStable = false;
            break;
        }
    }

    // Проверяем рост и убывание
    trends.isIncreasing = totalChange > 0;
    trends.isDecreasing = totalChange < 0;

    return trends;
}

//Тестируем стабильную последовательность с небольшими изменениями 
// {isStable: true, isIncreasing: true, isDecreasing: false}
const sequence1 = [100, 101, 100.5, 100.3, 100.8];
const result1 = alanyzeSequence(sequence1);
console.log(sequence1);

//Теститруем возрастающую  последовательность 
// {isStable: false, isIncreasing: true, isDecreasing: false}
const sequence2 = [50, 55, 60, 70, 80];
const result2 = alanyzeSequence(sequence2);
console.log(sequence2);

//Тестируем убывающую
// {isStable: false, isIncreasing: false, isDecreasing: true}
const sequence3 = [80, 70, 55, 60, 30];
const result3 = alanyzeSequence(sequence3);
console.log(sequence3);


/**
 * Вычисление среднего значения
 * @param values
 * @returns {number}
 */
function calculateAverage(values) {
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length || 0;
}

/**
 * Получение N элементов с наибольшим значением ключа
 * @param array
 * @param key
 * @param n
 * @returns {*}
 */
function getTopN(array, key, n) {
    return array.sort((a, b) => b[key] - a[key]).slice(0, n);
}

/**
 * Простой расчёт прибыли
 * @param item -  Продажи со скидкой
 * @param product - Количество продукта с закупочной ценой
 * @returns {number} - Чистая прибыль
 */
function simpleProfit(item, product) {
    return item.sale_price * item.quantity * (1 - item.discount / 100) - product.purchase_price * item.quantity;
}

/**
 * Накопительное вычисление прибыли, выручки и других метрик
 * @param records - Массив записи о продажах purchase__records 
 * @param calculateProfit - Функция из simpleProfit, делаем как параметр, тк логика расчета в функции может измениться
 * @param products - Массив обьектов с информацией о товарах products
 * @returns {*} - Статистика, сгруппированная по продавцам, покупателям и продуктам
 */
function baseMetrics(records, calculateProfit, products) {
// Принимает начальное значение аккумулятора { sellers: {}, customers: {}, peroducts: {} }
// содержит статистики сгенерированные по продавцам, покупателям и продуктам  
    return records.reduce((acc, record) => {
        const sellerId = record.seller_id;
        const customerId = record.customer_id;

        if (!acc.sellers[sellerId]) acc.sellers[sellerId] = { revenue: 0, profit: 0, items: [], customers: new Set() };
        if (!acc.customers[customerId]) acc.customers[customerId] = { revenue: 0, profit: 0, sellers: new Set() };

      // Для каждого товара в records.items, находит соответствующий продукт в массиве products и рассчитывает прибыль для товара  
        record.items.forEach(item => {
            // Находит соответствующий продукт в массиве products
            const product = products.find(p => p.sku === item.sku);
            // Рассчитывает прибыль для товара
            const profit = calculateProfit(item, product);

            // Обновление статистики продавца
            acc.sellers[sellerId].revenue += item.sale_price * item.quantity * (1 - item.discount / 100);
            acc.sellers[sellerId].profit += profit;
            acc.sellers[sellerId].items.push(item);
            acc.sellers[sellerId].customers.add(customerId);

            // Обновление статистики покупателя
            acc.customers[customerId].revenue += item.sale_price * item.quantity * (1 - item.discount / 100);
            acc.customers[customerId].profit += profit;
            acc.customers[customerId].sellers.add(sellerId);

            // Обновление статистики по продуктам
            if (!acc.products[item.sku]) acc.products[item.sku] = { quantity: 0, revenue: 0 };
            acc.products[item.sku].quantity += item.quantity;
            acc.products[item.sku].revenue += item.sale_price * item.quantity * (1 - item.discount / 100);
        });

        return acc;
    }, { sellers: {}, customers: {}, products: {} });
}

console.log(baseMetrics(data.purchase_records, simpleProfit, data.products));

/**
 * Вычисление бонусов по специальным условиям
 * Сама функция помогает убрать дублирования, на основе данных сразу рассчитаем все бонусы (экономия + легче добавить будет в будущем еще один бонус)
 * @param data - Массив data
 * @param options {{accumulateMetrics: ((function(*, *, *): *)|*), 
 * calculateProfit: ((function(*, *): number)|*)}}
 * @param bonusFunctions - Массив функция для расчета бонусов, каждая функция будет принимать массив
 * с данными и возвращать определенный результат 
 * @returns {*}
 */
function calculateSpecialBonuses(data, options, bonusFunctions) {
    const { calculateProfit, accumulateMetrics } = options;
    // Группировка данных
    const recordsBySeller = groupBy(data.purchase_records, record => record.seller_id);
    const recordsByCustomer = groupBy(data.purchase_records, record => record.customer_id);
    const recordsByProduct = groupBy(data.purchase_records.flatMap(record => record.items), item => item.sku);

    // Накопительная статистикa
    // Вызывается функция baseMetrics, используется массив о продажах, внутрь передаем функцию simpleProfit(которую деструктурировали для расчета прибыли)
    const stats = accumulateMetrics(data.purchase_records, calculateProfit, data.products);

    // Вызов функций для расчёта бонусов
    return bonusFunctions.map(func =>
        func({
            stats,
            recordsBySeller,
            recordsByCustomer,
            recordsByProduct,
            sellers: data.sellers,
            customers: data.customers,
            products: data.products,
            calculateProfit
        })
    );
}

// 1. Продавец, привлекший лучшего покупателя
function bonusBestCustomer({ stats }) {
    const bestCustomer = Object.entries(stats.customers).reduce((max, [id, data]) =>
        data.revenue > (max?.revenue || 0) ? { id, ...data } : max, null);

    const sellerId = Array.from(bestCustomer.sellers).reduce((topSeller, sellerId) => {
        const revenue = stats.sellers[sellerId]?.revenue || 0;
        return revenue > (topSeller?.revenue || 0) ? { sellerId, revenue } : topSeller;
    }, null).sellerId;

    return {
        category: "Best Customer Seller",
        seller_id: sellerId,
        bonus: +(bestCustomer.revenue * 0.05).toFixed(2), // Плюсик, чтобы преобразовать в число
    };
}

// 2. Продавец, лучше всего удерживающий покупателя
function bonusCustomerRetention({ stats }) {
    const bestRetention = Object.entries(stats.sellers).reduce((best, [sellerId, data]) => {
        const customerCounts = Array.from(data.customers).map(customerId =>
            stats.customers[customerId]?.revenue || 0);
        const maxCustomerRevenue = Math.max(...customerCounts);

        return maxCustomerRevenue > (best?.revenue || 0) ? { sellerId, revenue: maxCustomerRevenue } : best;
    }, null);

    return {
        category: "Best Customer Retention",
        seller_id: bestRetention.sellerId,
        bonus: 1000,
    };
}

// 3. Продавец, привлекший клиента с наибольшим чеком
function bonusLargestSingleSale({ recordsBySeller }) {
    const largestSale = Object.entries(recordsBySeller).reduce((max, [sellerId, records]) => {
        const largestRecord = records.reduce((recordMax, record) =>
            record.total_amount > (recordMax?.total_amount || 0) ? record : recordMax, null);
        return largestRecord?.total_amount > (max?.total_amount || 0) ? largestRecord : max;
    }, null);

    return {
        category: "Largest Single Sale",
        seller_id: largestSale.seller_id,
        bonus: +(largestSale.total_amount * 0.1).toFixed(2),
    };
}

// 4. Продавец с наибольшей средней прибылью
function bonusHighestAverageProfit({ stats }) {
    const bestSeller = Object.entries(stats.sellers).reduce((max, [sellerId, data]) => {
        const avgProfit = data.profit / (data.items.length || 1);
        return avgProfit > (max?.avgProfit || 0) ? { sellerId, avgProfit } : max;
    }, null);

    return {
        category: "Highest Average Profit",
        seller_id: bestSeller.sellerId,
        bonus: +(bestSeller.avgProfit * 0.1).toFixed(2),
    };
}

// 5. Продавец со стабильно растущей средней прибылью
function bonusStableGrowth({ recordsBySeller, calculateProfit, products }) {
    const bestSeller = Object.entries(recordsBySeller).reduce((best, [sellerId, records]) => {
        const monthlyProfits = groupBy(records, record => record.date.slice(0, 7));
        const monthlyAverages = Object.entries(monthlyProfits)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([month, records]) =>
                calculateAverage(records.flatMap(record =>
                    record.items.map(item => calculateProfit(item, products.find(p => p.sku === item.sku))))));

        const { isStable, isIncreasing } = analyzeSequence(monthlyAverages, 0.05);

        if (isStable && isIncreasing) {
            const avgProfit = calculateAverage(monthlyAverages);
            return avgProfit > (best?.avgProfit || 0) ? { sellerId, avgProfit } : best;
        }

        return best;
    }, null);

    return {
        category: "Stable Growth",
        seller_id: bestSeller?.sellerId,
        bonus: +(bestSeller ? bestSeller.avgProfit * 0.15 : 0).toFixed(2),
    };
}
