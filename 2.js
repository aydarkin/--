/**
 * Алгоритм генерации первых времен однородного Пуассоновского процесса
 * @param {number} T - единиц времени, время окончания процесса
 */
function poissonProcessUniform(T, lambda = 1) {
    let t = 0
    const events = []

    let u = Math.random()
    t = t - 1 / lambda * Math.log(u)
    while (!(t > T)) {
        events.push(t)

        u = Math.random()
        t = t - 1 / lambda * Math.log(u)
    }

    return { events, count: events.length }
}

function poissonProcessNonuniform(T, lambda = 1, functionIntensity) {
    let t = 0
    const events = []

    let u = Math.random()
    t = t - 1 / lambda * Math.log(u)

    while (!(t > T)) {
        const u2 = Math.random()
        if (u2 <= (functionIntensity(t) / lambda)) {
            events.push(t)
        }

        u = Math.random()
        t = t - 1 / lambda * Math.log(u)
    }

    return { events, count: events.length }  
}


function functionIntensity(t) {
    return 1 + 2/(t+1)
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

function checkPoisson(values, N) {
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

    // разбитие, число значений
    const s = values.length

    // выборочное среднее
    const mean = 1 / N * values.reduce((acc, value, i) => acc + (value * i), 0)
    const expectedLambda = mean

    const theoryValues = []
    values.forEach((_, i) => {
        const fact = factorial(i)
        const pi = Math.exp(-expectedLambda) * (expectedLambda**i) / fact
        theoryValues[i] = pi * N
    })
    
    // критерий согласия Пирсона (хи квадрат)
    const chi2 = values.reduce((acc, _, i) => acc + ((values[i] - theoryValues[i])**2 / theoryValues[i]), 0)

    // степени свободы
    const k = s - 2

    // хи квадрат критическое при заданном k
    const chi2Critical = chi2Criticals[k-1]

    const result = {}
    values.forEach((value, i) => {
        result[i] = {
            "число событий": i,
            "частота": value,
            "частота теоретическая": theoryValues[i]
        }
    })
    console.table(result)

    console.log(`Степень свободы k = ${k}`)
    console.log(`Уровень значимости alpha = 0.05`)

    console.log(`Хи квадрат наблюдаемое = ${chi2}`)
    console.log(`Хи квадрат критическое = ${chi2Critical}`)
    console.log(`Хи2 наблюдаемое ${chi2 < chi2Critical ? '<' : '>='} Хи2 критическое => исследуемая случайная переменная ${chi2 < chi2Critical ? '' : 'не '}принадлежит закону распределения`)
}


function main() {
    const lambda = 2.01
    const time = 1
    const N = 2000

    console.log(`время = ${time}, lambda = ${lambda}, испытаний = ${N}:`)
    
    console.log(`Однородный Пуассоновский процесс:`);
    let values = []
    for (let index = 0; index < N; index++) {
        const x = poissonProcessUniform(time, lambda).count
        if (values[x]) {
            values[x] += 1
        } else {
            values[x] = 1
        }  
    }

    checkPoisson(values, N)

    console.log()

    console.log(`Неоднородный Пуассоновский процесс:`);
    values = []
    for (let index = 0; index < N; index++) {
        const x = poissonProcessNonuniform(time, lambda, functionIntensity).count
        if (values[x]) {
            values[x] += 1
        } else {
            values[x] = 1
        }  
    }

    checkPoisson(values, N)
}
main()
