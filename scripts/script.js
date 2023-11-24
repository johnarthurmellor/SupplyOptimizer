(() => {

    VANTA.NET({
        el: "#background",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3f4480,
        backgroundColor: 0x15172b,
        points: 20.00,
        maxDistance: 25.00,
        showDots: false
    });

    function getWorkingDays(numDays) {
        const weekdays = [];
        const currentDate = new Date(new Date().getFullYear(), 0, 1);
      
        while (weekdays.length < numDays) {
          if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
            weekdays.push(new Date(currentDate));
          }
      
          currentDate.setDate(currentDate.getDate() + 1);
        }
      
        return weekdays;
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
          processingTime = document.querySelector('.form__input[name="processingTime"]');

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        let yearDuration = periodDuration.value,
            dailyDemand = annualDemand.value / yearDuration;
            orderSize = Math.sqrt(2 * orderCost.value * (annualDemand.value / holdingCost.value)),
            averageInventory = orderSize / 2,
            replenishmentFrequencyInYears = orderSize / annualDemand.value,
            replenishmentFrequencyInDays = replenishmentFrequencyInYears * yearDuration,
            annualHoldingCosts = (orderCost.value * annualDemand.value) / orderSize + holdingCost.value * averageInventory,
            reorderPoint = processingTime.value < Math.floor(replenishmentFrequencyInDays) 
                           ? reorderPoint = processingTime.value * dailyDemand 
                           : (processingTime.value - Math.floor(processingTime.value / replenishmentFrequencyInDays) * replenishmentFrequencyInDays) * dailyDemand;
        
        console.log('Оптимальный размер заказа:', Math.ceil(orderSize));
        console.log('Оптимальный средний уровень запаса:',  Math.ceil(averageInventory));
        console.log('Оптимальная периодичность пополнения запасов (в днях):', Math.floor(replenishmentFrequencyInDays));
        console.log('Точка заказа:', Math.floor(reorderPoint));
        console.log('Общегодовые издержки по складу:', Math.ceil(annualHoldingCosts));

    })
})();