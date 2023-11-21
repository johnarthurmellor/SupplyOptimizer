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
          annualDemand = document.querySelector('.form__input[name="annualDemand"]'),
          orderCost = document.querySelector('.form__input[name="orderCost"]'),
          holdingCost = document.querySelector('.form__input[name="holdingCost"]'),
          processingTime = document.querySelector('.form__input[name="processingTime"]');

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        let optimalOrderSize = Math.sqrt(2 * orderCost.value * (annualDemand.value / holdingCost.value)),
            optimalAverageInventoryLevel = optimalOrderSize / 2,
            optimalReplenishmentFrequency_Years = optimalOrderSize / annualDemand.value,
            optimalReplenishmentFrequency_Days = optimalReplenishmentFrequency_Years * 300,
            reorderPoint,
            annualWarehouseHoldingSosts;

        console.log('Оптимальный размер заказа:', optimalOrderSize);
        console.log('Оптимальный средний уровень запаса:',  optimalAverageInventoryLevel);
        console.log('Оптимальная периодичность пополнения запасов (в годах):', optimalReplenishmentFrequency_Years);
        console.log('Оптимальная периодичность пополнения запасов (в днях):', optimalReplenishmentFrequency_Days);
        console.log('Точка заказа:', 0);
        console.log('Общегодовые издержки по складу:', 0);
    })

})();