(() => {
    function formatDate(date) {
        const dd = date.getDate().toString().padStart(2, '0');
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const yy = (date.getFullYear() % 100).toString().padStart(2, '0');
        return `${dd}.${mm}.${yy}`;
    }

    function getWorkingDays(numDays) {
        const weekdays = [];
        const currentDate = new Date(new Date().getFullYear(), 0, 1);

        while (weekdays.length < numDays) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
                weekdays.push(formatDate(new Date(currentDate)));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return weekdays;
    }

    function getSupplyDays(yearDuration, processingTime, replenishmentFrequency) {
        const workingDays = getWorkingDays(yearDuration);
        const resultArray = [workingDays[0]];

        for (let i = replenishmentFrequency - 1; i < workingDays.length; i += replenishmentFrequency) {
            const supplyDay = workingDays[i];
            const reorderDay = workingDays[i - processingTime];

            resultArray.push(reorderDay, supplyDay, supplyDay);
        }

        return resultArray;
    }

    const getUniqueDates = (datesArray) => [...new Set(datesArray)];

    function createOrdersSize(orderSize, reorderPoint, datesArray) {
        const resultArray = [orderSize];

        for (let i = 1; i < datesArray.length; i += 3) {
            resultArray.push(reorderPoint, 0, orderSize);
        }

        return resultArray;
    }

    function createChartData(yearDuration, processingTime, replenishmentFrequency, orderSize, reorderPoint) {
        const datesArray = getSupplyDays(yearDuration, processingTime, replenishmentFrequency);
        const ordersArray = createOrdersSize(orderSize, reorderPoint, datesArray);

        return datesArray.map((date, i) => ({ x: date, y: ordersArray[i] }));
    }

    const formatInput = (input) => {
        input.value = input.value.replace(/[^\d.]/g, '');

        if (input.value.startsWith('.')) {
            input.value = '';
        }

        if (/^0[0-9]/.test(input.value)) {
            input.value = input.value.slice(1);
        }

        const dotIndex = input.value.indexOf('.');
        if (dotIndex !== -1) {
            input.value = input.value.slice(0, dotIndex + 1) + input.value.slice(dotIndex).replace(/\./g, '');
        }
    };

    const labels = document.querySelectorAll('.form__label'),
          [periodDuration, annualDemand, orderCost, holdingCost, processingTime] = [
            'periodDuration',
            'annualDemand',
            'orderCost',
            'holdingCost',
            'processingTime',
          ].map((name) => document.querySelector(`.form__input[name="${name}"]`));

    labels.forEach((label) => {
        const input = label.querySelector('.form__input');
        const span = label.querySelector('.form__span');

        input.addEventListener('input', () => {
            formatInput(input);
            span.classList.toggle('active', input.value !== '');
        });
    });

    const chartCanvas = document.getElementById('chart');

    chartCanvas.addEventListener('mouseenter', () => {
        document.body.style.overflow = 'hidden';
    });

    chartCanvas.addEventListener('mouseleave', () => {
        document.body.style.overflow = 'auto';
    });

    let chart;

    document.querySelector('.form__button').addEventListener('click', (e) => {
        e.preventDefault();

        if (![periodDuration, annualDemand, orderCost, holdingCost, processingTime].every((input) => input.value)) {
            return;
        }

        document.querySelector('.chart').classList.add('active');

        if (chart) {
            chart.destroy();
        }

        const yearDuration = periodDuration.value,
              dailyDemand = annualDemand.value / yearDuration,
              orderSize = Math.sqrt(2 * orderCost.value * (annualDemand.value / holdingCost.value)),
              averageInventory = orderSize / 2,
              replenishmentFrequencyInYears = orderSize / annualDemand.value,
              replenishmentFrequencyInDays = replenishmentFrequencyInYears * yearDuration,
              annualHoldingCosts = (orderCost.value * annualDemand.value) / orderSize + holdingCost.value * averageInventory,
              reorderPoint = processingTime.value < Math.floor(replenishmentFrequencyInDays)
                ? processingTime.value * dailyDemand
                : (processingTime.value - Math.floor(processingTime.value / replenishmentFrequencyInDays) 
                    * replenishmentFrequencyInDays) 
                    * dailyDemand,

              [orderSizeTd, averageInventoryTd, replenishmentFrequencyInDaysTd, reorderPointTd, annualHoldingCostsTd] =
                ['order-size', 'average-inventory', 'replenishment-frequency-in-days', 'reorder-point', 'annual-holding-costs'].map((className) => document.querySelector(`.${className}`));

        [orderSizeTd, averageInventoryTd, replenishmentFrequencyInDaysTd, reorderPointTd, annualHoldingCostsTd].forEach((td) => (td.innerHTML = ''));

        orderSizeTd.innerHTML = Math.ceil(orderSize);
        averageInventoryTd.innerHTML = Math.ceil(averageInventory);
        replenishmentFrequencyInDaysTd.innerHTML = Math.floor(replenishmentFrequencyInDays);
        reorderPointTd.innerHTML = Math.floor(reorderPoint);
        annualHoldingCostsTd.innerHTML = Math.ceil(annualHoldingCosts);

        const labels = getSupplyDays(yearDuration, processingTime.value, Math.floor(replenishmentFrequencyInDays)),
              uniqueLabels = getUniqueDates(labels),
              dates = createChartData(yearDuration, processingTime.value, Math.floor(replenishmentFrequencyInDays), Math.ceil(orderSize), Math.floor(reorderPoint));

        chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: uniqueLabels,
                datasets: [{
                    label: 'Количество товара',
                    data: dates,
                    borderWidth: 1,
                    fill: false,
                    borderColor: '#e9eaf0',
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 10,
                    tension: 0,
                }],
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#e9eaf0',
                            font: {
                                family: 'Montserrat',
                                size: 16,
                            },
                        },
                    },
                    title: {
                        display: false,
                        text: 'Оптимальная стратегия заказа',
                        color: '#e9eaf0',
                        font: {
                            family: 'Montserrat',
                            size: 30,
                            style: 'normal',
                            lineHeight: 1.2,
                        },
                    },
                },
                scales: {
                    x: {
                        min: 0,
                        max: 6,
                        ticks: {
                            color: '#e9eaf0',
                            font: {
                                family: 'Montserrat',
                                size: 14,
                                style: 'normal',
                                lineHeight: 1.2,
                            },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#e9eaf0',
                            font: {
                                family: 'Montserrat',
                                size: 14,
                                style: 'normal',
                                lineHeight: 1.2,
                            },
                        },
                    },
                },
            },
        });

        chart.canvas.parentNode.style.width = '100%';

        chart.canvas.addEventListener('wheel', (e) => {
            scroller(e, chart);
        });
    });

    function scroller(scroll, chart) {
        const dataLength = chart.data.labels.length;

        if (scroll.deltaY > 0) {
            if (chart.config.options.scales.x.max >= dataLength) {
                chart.config.options.scales.x.min = dataLength - 7;
                chart.config.options.scales.x.max = dataLength;
            } else {
                chart.config.options.scales.x.min += 1;
                chart.config.options.scales.x.max += 1;
            }
        } else if (scroll.deltaY < 0) {
            if (chart.config.options.scales.x.min <= 0) {
                chart.config.options.scales.x.min = 0;
                chart.config.options.scales.x.max = 6;
            } else {
                chart.config.options.scales.x.min -= 1;
                chart.config.options.scales.x.max -= 1;
            }
        }

        chart.update();
    }
})();
