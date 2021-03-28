// @ts-check

/**
 * Критические значения хи квадрат 
 * при alpha = 0.05
 * для числа степеней свободы от 1 до 10
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
 * @param {number} min
 * @param {number} max 
 */
function uniformDiscrete(min, max) {
    // задаем ближайшие целые значения внутри интервала
    if (!Number.isInteger) {
        min = Math.trunc(min) + 1
    }
    max = Math.trunc(max)

    const edgesCount = max - min + 1; // значений всего
    const segment = 1 / edgesCount // длина отрезка

    const edges = []
    for (let i = 0; i < edgesCount; i++) {
        edges[i] = (i+1) * segment
    }

    const u = Math.random()
    const numberSegment = edges.findIndex((value) => u <= value);
    return min + numberSegment
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
    const groups = Object.keys(result).map((key) => +key) 
    const xCenters = groups.map((begin) => +begin + 0.5) // т.к. интервал [i, i+1], то центр i + 0.5

    // Выборочное среднее
    const mean = 1 / N * groups.reduce((acc, xi, index) => {
        const ni = result[xi].count
        return acc + (xCenters[index] * ni)
    }, 0)

    // Дисперсия
    const variable = 1 / N * groups.reduce((acc, xi, index) => {
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
    const s = groups.length

    // теоритические частоты
    result[groups[0]].theory = N * density * (groups[1] - a$)
    if (s > 2) {
        for (let i = 1; i < s-1; i++) {
            result[groups[i]].theory = N * density * (groups[i] - groups[i-1])
        }
    }
    result[groups[s-1]].theory = N * density * (b$ - groups[s-1])

    // число степеней свободы k = s - 3
    const k = s - 3

    // критерий согласия Пирсона (хи квадрат)
    const chi2 = groups.reduce((acc, xi) => {
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

/**
 * Проверка дискретного равномерного распределения
 * @param {Record<number, IResultItem>} result - Результат выборки сгруппированный в единичные интервалы. 10 => интервал [10, 11)
 * @param {number} N - объем выборки
 */
function checkUniformDiscrete(result, N) {
    const values = Object.keys(result)
    // разбитие, число значений
    const s = values.length

    // число степеней свободы k = s - 3
    const k = s - 3

    // ожидаемая частота
    const expectedN = N / s

    // критерий согласия Пирсона (хи квадрат)
    const chi2 = values.reduce((acc, xi) => {
        const ni = result[xi].count
        return acc + ((ni - expectedN)**2 / expectedN)
    }, 0)

    const chi2Critical = chi2Criticals[k-1]

    console.table(result)
    console.log(`Ожидаемая частота ni = ${expectedN}`)
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

    console.log('Равномерное непрерывное распределение:')
    const result1 = {}
    for (let i = 0; i < (b-a); i++) {
        result1[a+i] = { count: 0 }
    }
    const N1 = 100000
    for (let index = 0; index < N1; index++) {
        const x = Math.trunc(uniform(a,b))
        result1[x].count += 1
    }
    // @ts-ignore
    checkUniform(result1, N1)

    console.log()

    console.log('Равномерное дискретное распределение:')
    const result2 = {}
    for (let i = 0; i < (b-a+1); i++) {
        result2[a+i] = { count: 0 }
    }
    const N2 = 100000
    for (let index = 0; index < N2; index++) {
        const x = uniformDiscrete(a,b)
        result2[x].count += 1
    }
    // @ts-ignore
    checkUniformDiscrete(result2, N2)
}
main()