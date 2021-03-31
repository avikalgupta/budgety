//---------------------------------------------------------
//------------------- BUDGET CONTROLLER -------------------
//---------------------------------------------------------

let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.total[type] = sum;     //*#*# DOUBT HERE  *#*#
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {

            let newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget
            data.budget = data.total.inc - data.total.exp;

            // Calculate the percentage of income that we spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calclatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentages: function () {
            let allPercentage = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentage;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            // console.log(data);
            console.log(data);
        }
    }
})();


//---------------------------------------------------------
//--------------------- UI CONTROLLER ---------------------
//---------------------------------------------------------


let UIController = (function () {

    let DOMString = {
        inputType: '.add-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputBtn: '.add-btn',
        incomeContainer: '.income-list',
        expensesContainer: '.expenses-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.budget-income-value',
        expensesLabel: '.budget-expenses-value',
        expensesPercentageLabel: '.budget-expenses-percentage',
        container: '.container',
        ExpensePercLabel: '.item-percentage',
        budgetDate: '.budget-title-month'
    }

    let formateNumber = function (num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);
        let numSplit = num.split('.');
        let int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        let dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    let nodeListForEach = function (list, callBack) {
        for (let i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        },

        addListItem: function (obj, type) {

            let html, newHtml, element;

            // Create html string with placeholder text
            if (type === 'inc') {
                element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMString.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder string with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));

            // Insert the html to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function (selectorId) {
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearField: function () {
            document.querySelector(DOMString.inputDescription).value = "";
            document.querySelector(DOMString.inputValue).value = "";
            document.querySelector(DOMString.inputDescription).focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMString.budgetLabel).textContent = formateNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expensesLabel).textContent = formateNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMString.expensesPercentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMString.expensesPercentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(DOMString.ExpensePercLabel);



            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });
        },

        displayDate: function () {
            let now, date, month, year;
            now = new Date();
            date = now.getDate();
            month = now.getMonth();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            year = now.getFullYear();

            document.querySelector(DOMString.budgetDate).textContent = date + ' ' + months[month] + ', ' + year;
        },

        changedType: function () {

            let fields = document.querySelectorAll(DOMString.inputType + ',' + DOMString.inputDescription + ',' + DOMString.inputValue);
            document.querySelector(DOMString.inputBtn).classList.toggle('red');

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
        },

        getDOMString: function () {
            return DOMString;
        }
    }

})();



//---------------------------------------------------------
//----------------  GLOBAL APP CONTROLLER -----------------
//---------------------------------------------------------

let controller = (function (budgetCtrl, UICtrl) {

    let setUpEventListeners = function () {

        let DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
        document.addEventListener('keypress', (e) => {
            if (e.which === 13 || e.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
    };

    let updatePercentage = function () {

        // Calculate the percentage
        budgetCtrl.calclatePercentages();

        // Read percentage from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // Update the UI from new percentage
        UICtrl.displayPercentages(percentages);
    };


    let ctrlAddItem = function () {

        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearField();

            // 5. Display the budget on the UI
            updateBudget();

            // 6. Display the updated percentage
            updatePercentage();
        };
    }

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();

            // Display the updated percentage
            updatePercentage();
        }
    }

    return {
        init: function () {
            setUpEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
        }
    }

})(budgetController, UIController);

controller.init();