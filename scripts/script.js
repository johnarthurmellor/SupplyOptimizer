(() => {

    function formatDate(date) {
        let dd = date.getDate();
        if (dd < 10) dd = '0' + dd;
      
        let mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;
      
        let yy = date.getFullYear() % 100;
        if (yy < 10) yy = '0' + yy;
      
        return dd + '.' + mm + '.' + yy;
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
        let resultArray = [];

        resultArray.push(workingDays[0]);

        for (let i = replenishmentFrequency - 1; i < workingDays.length; i += replenishmentFrequency) {
            const supplyDay = workingDays[i];
            const reorderDay = workingDays[i - processingTime];

            resultArray.push(reorderDay);
            resultArray.push(supplyDay);
            resultArray.push(supplyDay)
        }

        return resultArray;
    }

    function getUniqueDates(datesArray) {
        let result = [];
      
        for (let date of datesArray) {
          if (!result.includes(date)) {
            result.push(date);
          }
        }
      
        return result;
      }

    function createOrdersSize(orderSize, reorderPoint, datesArray) {
        let resultArray = [];
        const daysArrayLength = datesArray.length;

        resultArray.push(orderSize);

        for (let i = 1; i < daysArrayLength; i += 3) {
            resultArray.push(reorderPoint);
            resultArray.push(0);
            resultArray.push(orderSize);
        }

        return resultArray;
    }

    function createChartData(yearDuration, processingTime, replenishmentFrequency, orderSize, reorderPoint) {
        let resultArray = [];
        const datesArray = getSupplyDays(yearDuration, processingTime, replenishmentFrequency);
        const ordersArray = createOrdersSize(orderSize, reorderPoint, datesArray);

        for (let i = 0; i < datesArray.length; i++) {
            resultArray.push({
                x: datesArray[i],
                y: ordersArray[i]
            });
        }

        return resultArray;
    }
    
    const labels = document.querySelectorAll('.form__label');

    labels.forEach((label) => {
        const input = label.querySelector('.form__input');
        const span = label.querySelector('.form__span');

        input.addEventListener('input', function() {
            if (this.value.startsWith('.')) {
                this.value = '';
            }

            this.value = this.value.replace(/[^\d.]/g, '');

            if (/^0[0-9]/.test(this.value)) {
                this.value = this.value.slice(1);
            }

            const dotIndex = this.value.indexOf('.');
            if (dotIndex !== -1) {
                this.value = this.value.slice(0, dotIndex + 1) + this.value.slice(dotIndex).replace(/\./g, '');
            }

            if (this.value) {
                span.classList.add('active');
            } else {
                span.classList.remove('active');
            }
        });
    })

    const submitBtn = document.querySelector('.form__button'),
          periodDuration = document.querySelector('.form__input[name="periodDuration"]'),
          annualDemand = document.querySelector('.form__input[name="annualDemand"]'),
          orderCost = document.querySelector('.form__input[name="orderCost"]'),
          holdingCost = document.querySelector('.form__input[name="holdingCost"]'),
          processingTime = document.querySelector('.form__input[name="processingTime"]'),
          chartCanvas = document.getElementById('chart');

    chartCanvas.addEventListener('mouseenter', function(e) {
        document.body.style = 'overflow-y: hidden; overflow-x: hidden;'; 
    })

    chartCanvas.addEventListener('mouseleave', function(e) {
        document.body.style = 'overflow-y: auto; overflow-x: hidden;'; 
    })

    let chart;

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        if (!periodDuration.value 
            && !annualDemand.value 
            && !orderCost.value
            && !holdingCost.value
            && !processingTime.value) {
                return;
        }

        document.querySelector('.chart').classList.add('active');

        if (chart) {
            chart.destroy();
        }

        let yearDuration = periodDuration.value,
            dailyDemand = annualDemand.value / yearDuration,
            orderSize = Math.sqrt(2 * orderCost.value * (annualDemand.value / holdingCost.value)),
            averageInventory = orderSize / 2,
            replenishmentFrequencyInYears = orderSize / annualDemand.value,
            replenishmentFrequencyInDays = replenishmentFrequencyInYears * yearDuration,
            annualHoldingCosts = (orderCost.value * annualDemand.value) / orderSize + holdingCost.value * averageInventory,
            reorderPoint = processingTime.value < Math.floor(replenishmentFrequencyInDays) 
                            ? processingTime.value * dailyDemand 
                            : (processingTime.value - Math.floor(processingTime.value / replenishmentFrequencyInDays) * replenishmentFrequencyInDays) * dailyDemand;

        const orderSizeTd = document.querySelector('.order-size'),
              averageInventoryTd = document.querySelector('.average-inventory'),
              replenishmentFrequencyInDaysTd = document.querySelector('.replenishment-frequency-in-days'),
              reorderPointTd = document.querySelector('.reorder-point'),
              annualHoldingCostsTd = document.querySelector('.annual-holding-costs');

        orderSizeTd.innerHTML = 
            averageInventoryTd.innerHTML = 
            replenishmentFrequencyInDaysTd.innerHTML = 
            reorderPointTd.innerHTML = 
            annualHoldingCostsTd.innerHTML = '';

        orderSizeTd.innerHTML = Math.ceil(orderSize);
        averageInventoryTd.innerHTML = Math.ceil(averageInventory);
        replenishmentFrequencyInDaysTd.innerHTML = Math.floor(replenishmentFrequencyInDays);
        reorderPointTd.innerHTML = Math.floor(reorderPoint);
        annualHoldingCostsTd.innerHTML = Math.ceil(annualHoldingCosts);

        let labels = getSupplyDays(yearDuration, processingTime.value, Math.floor(replenishmentFrequencyInDays));
        let uniqueLabels = getUniqueDates(labels);
        let dates = createChartData(yearDuration, processingTime.value, Math.floor(replenishmentFrequencyInDays), Math.ceil(orderSize), Math.floor(reorderPoint));

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
                tension: 0
              }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: '#e9eaf0',
                            font: {
                                family: 'Montserrat',
                                size: 16
                            }
                        }
                    },
                    title: {
                      display: false,
                      text: 'Оптимальная стратегия заказа',
                      color: '#e9eaf0',
                      font: {
                        family: 'Montserrat',
                        size: 30,
                        style: 'normal',
                        lineHeight: 1.2
                      },
                    }
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
                                lineHeight: 1.2
                              },
                        }
                    },
                    y: {
                    beginAtZero: true,
                    ticks: {
                            color: '#e9eaf0',
                            font: {
                                family: 'Montserrat',
                                size: 14,
                                style: 'normal',
                                lineHeight: 1.2
                              },
                    }
                    }
                }
            }
          });

          chart.canvas.parentNode.style.width = '100%';

          chart.canvas.addEventListener('wheel', function(e) {
            scroller(e, chart);
          })

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
        } else {
            // do nothing
        }

        chart.update();
    }
})();