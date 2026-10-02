// API address
const API_URL = "http://localhost:3000/api/expenses";

// Store expenses in memory
let expenses = [];


// ================================
// GET ALL EXPENSES
// ================================
async function getExpenses() {

    showLoading();

    try {

        const response = await fetch(API_URL);

        const result = await response.text();

        if (!response.ok) {
            throw new Error(
                result || "Failed to get expenses"
            );
        }

        expenses = result
            ? JSON.parse(result)
            : [];

        renderTable(expenses);

        renderSummary(expenses);

    } catch (error) {

        console.error(
            "Get expenses error:",
            error
        );

        showAlert(
            "Failed to load expenses",
            "danger"
        );

    } finally {

        hideLoading();

    }
}


// ================================
// ADD EXPENSE
// ================================
async function addExpense(data) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.text();

        if (!response.ok) {
            throw new Error(
                result || "Failed to add expense"
            );
        }

        return result
            ? JSON.parse(result)
            : null;

    } catch (error) {

        console.error(
            "Add expense error:",
            error
        );

        throw error;

    }
}


// ================================
// UPDATE EXPENSE
// ================================
async function updateExpense(id, data) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(
                result || "Failed to update expense"
            );
        }

        return result
            ? JSON.parse(result)
            : null;

    } catch (error) {

        console.error(
            "Update expense error:",
            error
        );

        throw error;

    }
}


// ================================
// DELETE EXPENSE
// ================================
async function deleteExpense(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(
                result || "Failed to delete expense"
            );
        }

        return result
            ? JSON.parse(result)
            : null;

    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        throw error;

    }
}


// ================================
// REFRESH
// ================================
async function refresh() {

    await getExpenses();

}


// ================================
// RENDER TABLE
// ================================
function renderTable(list) {

    const tableBody =
        document.getElementById(
            "expenseTableBody"
        );

    tableBody.innerHTML = "";


    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center"
                >
                    No expenses found
                </td>
            </tr>
        `;

        return;
    }


    list.forEach(expense => {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>
                ${expense.title}
            </td>

            <td>
                ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                ${expense.category}
            </td>

            <td>
                ${expense.date}
            </td>

            <td>

                <button
                    class="btn btn-warning btn-sm"
                    onclick="editExpense(${expense.id})"
                >
                    Edit
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="removeExpense(${expense.id})"
                >
                    Delete
                </button>

            </td>
        `;


        tableBody.appendChild(row);

    });

}


// ================================
// RENDER SUMMARY
// ================================
function renderSummary(list) {

    // Number of expenses
    const expenseCount =
        list.length;


    document.getElementById(
        "expenseCount"
    ).textContent =
        expenseCount;


    // Total amount
    const total =
        list.reduce(
            (sum, expense) => {

                return sum +
                    Number(expense.amount);

            },
            0
        );


    document.getElementById(
        "totalAmount"
    ).textContent =
        total.toFixed(2);


    // Highest expense
    let highest = 0;


    if (list.length > 0) {

        highest =
            Math.max(
                ...list.map(
                    expense =>
                        Number(
                            expense.amount
                        )
                )
            );

    }


    document.getElementById(
        "highestExpense"
    ).textContent =
        highest.toFixed(2);

}


// ================================
// FILTER
// ================================
function applyFilter() {

    const selectedCategory =
        categoryFilter.value;


    if (selectedCategory === "All") {

        renderTable(expenses);

    } else {

        const filteredExpenses =
            expenses.filter(
                expense =>
                    expense.category ===
                    selectedCategory
            );

        renderTable(
            filteredExpenses
        );

    }


    // Summary cards always show all expenses
    renderSummary(expenses);

}


// ================================
// DELETE
// ================================
async function removeExpense(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    try {

        showLoading();


        await deleteExpense(id);


        showAlert(
            "Expense deleted successfully",
            "success"
        );


        await refresh();


    } catch (error) {

        console.error(error);


        showAlert(
            "Failed to delete expense",
            "danger"
        );


    } finally {

        hideLoading();

    }

}


// ================================
// OPEN EDIT MODAL
// ================================
function editExpense(id) {

    const expense =
        expenses.find(
            item =>
                item.id === id
        );


    if (!expense) {
        return;
    }


    // Put expense data inside modal
    document.getElementById(
        "editExpenseId"
    ).value =
        expense.id;


    document.getElementById(
        "editTitle"
    ).value =
        expense.title;


    document.getElementById(
        "editAmount"
    ).value =
        expense.amount;


    document.getElementById(
        "editCategory"
    ).value =
        expense.category;


    document.getElementById(
        "editDate"
    ).value =
        expense.date;


    // Open Bootstrap modal
    const modalElement =
        document.getElementById(
            "editExpenseModal"
        );


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();

}


// ================================
// SAVE EDITED EXPENSE
// ================================
const editExpenseForm =
    document.getElementById(
        "editExpenseForm"
    );


if (editExpenseForm) {

    editExpenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editExpenseId"
                ).value;


            const title =
                document.getElementById(
                    "editTitle"
                ).value.trim();


            const amount =
                Number(
                    document.getElementById(
                        "editAmount"
                    ).value
                );


            const category =
                document.getElementById(
                    "editCategory"
                ).value;


            const date =
                document.getElementById(
                    "editDate"
                ).value;


            const updatedExpense = {

                title: title,

                amount: amount,

                category: category,

                date: date

            };


            try {

                showLoading();


                await updateExpense(
                    id,
                    updatedExpense
                );


                showAlert(
                    "Expense updated successfully",
                    "success"
                );


                // Close modal
                const modalElement =
                    document.getElementById(
                        "editExpenseModal"
                    );


                const modal =
                    bootstrap.Modal.getInstance(
                        modalElement
                    );


                if (modal) {

                    modal.hide();

                }


                // Refresh table
                await refresh();


            } catch (error) {

                console.error(
                    "Edit expense error:",
                    error
                );


                showAlert(
                    "Failed to update expense",
                    "danger"
                );


            } finally {

                hideLoading();

            }

        }
    );

}


// ================================
// LOADING
// ================================
function showLoading() {

    const loading =
        document.getElementById(
            "loading"
        );


    if (loading) {

        loading.classList.remove(
            "d-none"
        );

    }

}


function hideLoading() {

    const loading =
        document.getElementById(
            "loading"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }

}


// ================================
// ALERT
// ================================
function showAlert(
    message,
    type
) {

    const alertContainer =
        document.getElementById(
            "alertContainer"
        );


    if (!alertContainer) {
        return;
    }


    alertContainer.innerHTML = `

        <div
            class="alert alert-${type} alert-dismissible fade show"
            role="alert"
        >

            ${message}

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
            >
            </button>

        </div>

    `;


    setTimeout(
        () => {

            alertContainer.innerHTML =
                "";

        },
        3000
    );

}


// ================================
// ADD FORM
// ================================
const expenseForm =
    document.getElementById(
        "expenseForm"
    );


if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document.getElementById(
                    "title"
                ).value.trim();


            const amount =
                Number(
                    document.getElementById(
                        "amount"
                    ).value
                );


            const category =
                document.getElementById(
                    "category"
                ).value;


            const date =
                document.getElementById(
                    "date"
                ).value;


            const data = {

                title: title,

                amount: amount,

                category: category,

                date: date

            };


            try {

                showLoading();


                await addExpense(
                    data
                );


                showAlert(
                    "Expense added successfully",
                    "success"
                );


                expenseForm.reset();


                await refresh();


            } catch (error) {

                console.error(
                    "Final add expense error:",
                    error
                );


                showAlert(
                    "Failed to add expense",
                    "danger"
                );


            } finally {

                hideLoading();

            }

        }
    );

}


// ================================
// CATEGORY FILTER EVENT
// ================================
const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function () {

            applyFilter();

        }
    );

}


// ================================
// START APPLICATION
// ================================
refresh();