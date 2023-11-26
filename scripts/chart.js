export function createChart(chartCanvas, uniqueLabels, dates) {
    console.log(uniqueLabels);
    return new Chart(chartCanvas, {
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
        options: setupChartOptions(),
    });
};

function setupChartOptions() {
    return {
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
                display: false
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
    };
};