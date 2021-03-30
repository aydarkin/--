// @ts-check

/**
 * Критические значения хи квадрат 
 * при alpha = 0.05
 * для числа степеней свободы от 1 до 20
 */ 
const chi2Criticals = [
    3.8,
    6,
    7.8,
    9.5,
    11.1,
    12.6,
    14.1,
    15.5,
    16.9,
    18.3,

    19.7,
    21,
    22.4,
    23.7,
    25,
    26.3,
    27.6,
    28.9,
    30.1,
    31.4
]

/**
 * Получить значение согласно непрерывному равномерному распределению [min, max]
 * @param {number} min 
 * @param {number} max 
 */
function uniform(min, max) {
    const u = Math.random()
    return min + (max - min) * u
}

/**
 * Получить значение согласно дискретному равномерному распределению [min, max]
 * @param {number} lambda - параметр интенсивности
 */
function poisson(lambda) {
    const u = Math.random()
    let p = Math.exp(-lambda)

    let f = p
    let i = 0
    while (!(u < f)) {
        p = lambda * p / (i+1)
        f += + p
        i += 1
    }

    return i
}

/**
 * @typedef {Object} IResultItem
 * @property {number} count - наблюдаемая частота 
 * @property {number?} theory - теоретическая частота 
 */

/**
 * Проверка непрерывного равномерного распределения
 * @param {Record<number, IResultItem>} result - Результат выборки сгруппированный в единичные интервалы. 10 => интервал [10, 11)
 * @param {number} N - объем выборки
 */
function checkUniform(result, N) {
    const intervals = Object.keys(result).map((key) => +key) 
    const xCenters = intervals.map((begin) => +begin + 0.5) // т.к. интервал [i, i+1], то центр i + 0.5

    // Выборочное среднее
    const mean = 1 / N * intervals.reduce((acc, xi, index) => {
        const ni = result[xi].count
        return acc + (xCenters[index] * ni)
    }, 0)

    // Дисперсия
    const variable = 1 / N * intervals.reduce((acc, xi, index) => {
        const ni = result[xi].count
        return acc + (ni * ((xCenters[index] - mean)**2))
    }, 0)

    // Среднеквадратичное отклонение
    const sd = Math.sqrt(variable)

    // оценки параметров a, b равномерного распределения
    const a$ = mean - Math.sqrt(3) * sd
    const b$ = mean + Math.sqrt(3) * sd

    // плотность
    const density = 1 / (b$ - a$)
    
    // разбитие, число значений
    const s = intervals.length

    // теоритические частоты
    result[intervals[0]].theory = N * density * (intervals[1] - a$)
    if (s > 2) {
        for (let i = 1; i < s-1; i++) {
            result[intervals[i]].theory = N * density * (intervals[i] - intervals[i-1])
        }
    }
    result[intervals[s-1]].theory = N * density * (b$ - intervals[s-1])

    // число степеней свободы k = s - 3
    const k = s - 3

    // критерий согласия Пирсона (хи квадрат)
    const chi2 = intervals.reduce((acc, xi) => {
        const ni = result[xi].count
        const niTheory = result[xi].theory
        return acc + ((ni - niTheory)**2 / niTheory)
    }, 0)

    const chi2Critical = chi2Criticals[k-1]

    const resultTable =  {}
    Object.keys(result).forEach((key) => {
        resultTable[`${key}-${+key+1}`] = result[key]
    })
    console.table(resultTable)
    console.log(`Степень свободы k = ${k}`)
    console.log(`Уровень значимости alpha = 0.05`)

    console.log(`Хи квадрат наблюдаемое = ${chi2}`)
    console.log(`Хи квадрат критическое = ${chi2Critical}`)
    console.log(`Хи2 наблюдаемое ${chi2 < chi2Critical ? '<' : '>='} Хи2 критическое => исследуемая случайная переменная ${chi2 < chi2Critical ? '' : 'не '}принадлежит закону распределения`)
}

function factorial(n) {
    if (n < 2) {
        return 1
    }

    let result = 1
    for (let i = 1; i <= n; i++) {
        result *= i
    }
    return result
}

/**
 * Проверка дискретного равномерного распределения
 * @param {Record<number, IResultItem>} result - Результат выборки сгруппированный в единичные интервалы. 10 => интервал [10, 11)
 * @param {number} N - объем выборки
 */
function checkPoisson(result, N) {
    const values = Object.keys(result).map((str) => +str)
    // разбитие, число значений
    const s = values.length

    // выборочное среднее
    const mean = 1 / N * values.reduce((acc, xi) => {
        const ni = result[xi].count
        return acc + (+xi * ni)
    }, 0)

    const expectedLambda = mean

    values.forEach((value) => {
        const fact = factorial(value)
        const pi = Math.exp(-expectedLambda) * (expectedLambda**value) / fact
        result[value].theory = pi * N
    })
    
    // критерий согласия Пирсона (хи квадрат)
    const chi2 = values.reduce((acc, xi) => {
        const ni = result[xi].count
        const niTheory = result[xi].theory
        return acc + ((ni - niTheory)**2 / niTheory)
    }, 0)

    // степени свободы
    const k = s - 2

    // хи квадрат критическое при заданном k
    const chi2Critical = chi2Criticals[k-1]
    console.table(result)

    console.log(`lamda теоретическая = ${expectedLambda}`)
    console.log(`Степень свободы k = ${k}`)
    console.log(`Уровень значимости alpha = 0.05`)

    console.log(`Хи квадрат наблюдаемое = ${chi2}`)
    console.log(`Хи квадрат критическое = ${chi2Critical}`)
    console.log(`Хи2 наблюдаемое ${chi2 < chi2Critical ? '<' : '>='} Хи2 критическое => исследуемая случайная переменная ${chi2 < chi2Critical ? '' : 'не '}принадлежит закону распределения`)
}

/* Начало */
function main() {
    const a = 2
    const b = 14

    const result1 = {}
    for (let i = 0; i < (b-a); i++) {
        result1[a+i] = { count: 0 }
    }
    const N1 = 200
    console.log(`Равномерное непрерывное распределение (опытов ${N1}):`)
    for (let index = 0; index < N1; index++) {
        const x = Math.trunc(uniform(a,b))
        result1[x].count += 1
    }
    // @ts-ignore
    checkUniform(result1, N1)

    console.log()

    
    const result2 = {}
    const N2 = 20000
    const lambda = 5
    console.log(`Пуассоновское распределение (lambda = ${lambda}, опытов ${N2}):`)
    for (let index = 0; index < N2; index++) {
        const x = poisson(lambda)
        
        if (result2[x]) {
            result2[x].count += 1
        } else {
            result2[x] = { count: 1 }
        }
        
    }
    // @ts-ignore
    checkPoisson(result2, N2)
}
main()