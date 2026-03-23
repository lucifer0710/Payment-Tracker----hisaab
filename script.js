import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// PASTE YOUR FIREBASE CONFIG HERE 
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveUser(name, userData) {
    await setDoc(doc(db, "records", name), userData);
}

async function removeUser(name) {
    await deleteDoc(doc(db, "records", name));
}

let data = {};
let activeUser = null;
let pendingDeletePaymentIndex = null;
let initialLoadDone = false;

window.addEventListener('DOMContentLoaded', () => {
    showLoader(true);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newDateGiven').value = today;
    document.getElementById('recDate').value = today;

    onSnapshot(collection(db, "records"), (snap) => {
        if (!initialLoadDone) {
            data = {};
            snap.forEach(d => { data[d.id] = d.data(); });
            initialLoadDone = true;
            showLoader(false);
        } else {
            snap.docChanges().forEach(change => {
                if (change.type === "added" || change.type === "modified") {
                    data[change.doc.id] = change.doc.data();
                }
                if (change.type === "removed") {
                    delete data[change.doc.id];
                }
            });
        }

        if (!activeUser) renderDashboard();
        else renderTransactions();
    }, (error) => {
        showLoader(false);
        document.getElementById('loader').innerHTML = `
                    <div class="text-center p-8">
                        <p class="text-red-500 font-bold text-lg mb-2">Firebase connection failed</p>
                        <p class="text-slate-400 text-sm mb-2">This is usually a Firestore security rules issue.</p>
                        <p class="text-slate-400 text-xs mb-4">Go to Firebase Console → Firestore → Rules and set:<br><code class="bg-slate-100 px-2 py-1 rounded text-slate-700">allow read, write: if true;</code></p>
                        <p class="text-slate-300 text-xs mt-2">${error.message}</p>
                    </div>`;
        document.getElementById('loader').classList.remove('hidden');
    });
});

function showLoader(visible) {
    document.getElementById('loader').classList.toggle('hidden', !visible);
}

window.showModal = (id) => document.getElementById(id).classList.remove('hidden');
window.hideModal = (id) => document.getElementById(id).classList.add('hidden');

function rawNum(val) { return val.replace(/,/g, ''); }

function liveFormat(inputEl) {
    const digits = rawNum(inputEl.value).replace(/\D/g, '');
    inputEl.value = digits === '' ? '' : formatIndian(parseInt(digits, 10));
}

function formatIndian(num) {
    num = Math.round(num);
    let s = String(Math.abs(num));
    let result = '';
    if (s.length <= 3) {
        result = s;
    } else {
        result = s.slice(-3);
        s = s.slice(0, -3);
        while (s.length > 2) { result = s.slice(-2) + ',' + result; s = s.slice(0, -2); }
        if (s.length > 0) result = s + ',' + result;
    }
    return (num < 0 ? '-' : '') + result;
}
function formatDateDMY(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}
window.processNewUser = async () => {
    const name = document.getElementById('newUserName').value.trim();
    const rawVal = rawNum(document.getElementById('newPrincipal').value).trim();
    const principal = parseFloat(rawVal);
    const date = document.getElementById('newDateGiven').value;


    if (!name) { alert('Please enter a name.'); return; }
    if (!rawVal || isNaN(principal) || principal <= 0) { alert('Please enter a valid amount.'); return; }
    if (!date) { alert('Please select a date.'); return; }

    const userData = { principal, dateGiven: date, rate: 0, months: 1, logs: [] };

    hideModal('addUserModal');
    document.getElementById('newUserName').value = '';
    document.getElementById('newPrincipal').value = '';

    data[name] = userData;
    await saveUser(name, userData);
    renderDashboard();
};

function renderDashboard() {
    const list = document.getElementById('userList');
    const search = document.getElementById('searchBar').value.toLowerCase();
    list.innerHTML = '';

    const names = Object.keys(data);
    if (names.length === 0) {
        list.innerHTML = `<div class="text-center py-16 text-slate-300">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p class="font-bold">No records yet</p>
                    <p class="text-sm mt-1">Tap + to add your first record</p>
                </div>`;
        return;
    }

    names.forEach(name => {
        if (name.toLowerCase().includes(search)) {
            const stats = calculateAll(name);
            const card = document.createElement('div');
            card.className = "bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300 transition-all";
            card.onclick = () => openUser(name);
            card.innerHTML = `<div>
                        <div class="font-bold text-green-600 text-lg">${name}</div>
                        <div class="text-[12px] text-slate-600">Principal ${formatIndian(data[name].principal)}<br>on ${formatDateDMY(data[name].dateGiven)}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-black text-blue-600 text-xl">${formatIndian(stats.balance)}</div>
                        <div class="text-[9px] uppercase font-bold text-slate-300">Remaining</div>
                    </div>`;
            list.appendChild(card);
        }
    });
}

function calculateAll(name) {
    const user = data[name];
    const interestAmount = user.principal * (user.rate / 100);
    const totalWithInterest = user.principal + interestAmount;
    const paid = user.logs.reduce((acc, curr) => acc + curr.amount, 0);
    return {
        totalWithInterest,
        balance: Math.round(totalWithInterest - paid),
        emi: user.months > 0 ? (totalWithInterest / user.months).toFixed(2) : totalWithInterest
    };
}

window.openUser = (name) => {
    activeUser = name;
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    document.getElementById('currentUserName').innerText = name;
    document.getElementById('principalDisplay').innerText = formatIndian(data[name].principal);
    document.getElementById('rateInput').value = data[name].rate;
    document.getElementById('timeInput').value = data[name].months;
    document.getElementById('recDate').value = new Date().toISOString().split('T')[0];
    renderTransactions();
};

window.updateSettings = async () => {
    data[activeUser].rate = parseFloat(document.getElementById('rateInput').value) || 0;
    data[activeUser].months = parseFloat(document.getElementById('timeInput').value) || 1;
    await saveUser(activeUser, data[activeUser]);
    renderTransactions();
};

window.addTransaction = async () => {
    const rawVal = rawNum(document.getElementById('recAmount').value).trim();
    const amount = parseFloat(rawVal);
    const date = document.getElementById('recDate').value;
    if (!rawVal || isNaN(amount) || amount <= 0) { alert('Please enter a valid amount.'); return; }
    if (!date) { alert('Please select a date.'); return; }

    hideModal('addRecordModal');
    document.getElementById('recAmount').value = '';

    data[activeUser].logs.push({ amount, date });
    await saveUser(activeUser, data[activeUser]);
    renderTransactions();
};

window.confirmDeleteUser = () => {
    document.getElementById('deleteUserNameLabel').innerText = activeUser;
    showModal('deleteUserModal');
};

window.deleteUser = async () => {
    await removeUser(activeUser);
    delete data[activeUser];
    hideModal('deleteUserModal');
    closeDetail();
};

window.confirmDeletePaymentAt = (index) => {
    const log = data[activeUser].logs[index];
    pendingDeletePaymentIndex = index;
    document.getElementById('deletePaymentLabel').innerText = `+ ${formatIndian(log.amount)}  •  ${formatDateDMY(log.date)}`;
    showModal('deletePaymentModal');
};

window.confirmDeletePayment = async () => {
    if (pendingDeletePaymentIndex === null) return;
    data[activeUser].logs.splice(pendingDeletePaymentIndex, 1);
    pendingDeletePaymentIndex = null;
    hideModal('deletePaymentModal');
    await saveUser(activeUser, data[activeUser]);
    renderTransactions();
};

function renderTransactions() {
    const logBox = document.getElementById('transactionLogs');
    const stats = calculateAll(activeUser);
    logBox.innerHTML = '<h3 class="font-bold text-slate-500 text-[13px] uppercase tracking-widest mb-4">Payment History</h3>';

    const sortedLogs = data[activeUser].logs
        .map((t, i) => ({ ...t, originalIndex: i }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedLogs.length === 0) {
        logBox.innerHTML += `<p class="text-center text-slate-300 text-sm py-6">No payments recorded yet</p>`;
    }

    sortedLogs.forEach(t => {
        const item = document.createElement('div');
        item.className = "flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100";
        item.innerHTML = `
                    <div><span class="text-slate-700 block text-[17px] font-bold uppercase">${formatDateDMY(t.date)}</span></div>
                    <div class="flex items-center gap-3">
                        <span class="font-mono font-bold text-emerald-600">+ ${formatIndian(t.amount)}</span>
                        <button onclick="confirmDeletePaymentAt(${t.originalIndex})" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition text-red-400 hover:text-red-600" title="Delete payment">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>`;
        logBox.appendChild(item);
    });

    document.getElementById('totalBalance').innerText = formatIndian(stats.balance);
    document.getElementById('emiDisplay').innerText = formatIndian(parseFloat(stats.emi));
}

window.closeDetail = () => {
    activeUser = null;
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('detailView').classList.add('hidden');
    renderDashboard();
};

document.getElementById('searchBar').oninput = renderDashboard;
document.getElementById('newPrincipal').addEventListener('input', function () { liveFormat(this); });
document.getElementById('recAmount').addEventListener('input', function () { liveFormat(this); });
