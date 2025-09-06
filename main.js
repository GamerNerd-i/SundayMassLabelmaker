function pad(n) {
    return String(n).padStart(2, "0");
}
function fmtMMDDYY(date) {
    return (
        pad(date.getMonth() + 1) +
        "/" +
        pad(date.getDate()) +
        "/" +
        String(date.getFullYear()).slice(-2)
    );
}

function getSundays(startDate, endDate) {
    const sundays = [];
    const day = startDate.getDay(); // 0 = Sunday
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    let current = new Date(startDate);
    current.setDate(current.getDate() + daysUntilSunday);
    while (current <= endDate) {
        sundays.push(new Date(current));
        current.setDate(current.getDate() + 7);
    }
    return sundays;
}

function batched(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

function csvEscape(cell) {
    // wrap cell in quotes, double any internal quotes
    return '"' + String(cell).replace(/"/g, '""') + '"';
}

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date(Date.now());
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    document.getElementById("start").value = today.toISOString();
    document.getAnimations("end").value = nextYear.toISOString();
});

document.getElementById("generate").addEventListener("click", () => {
    const startVal = document.getElementById("start").value;
    const endVal = document.getElementById("end").value;
    if (!startVal || !endVal) {
        alert("Please pick both a start and an end date.");
        return;
    } else if (startVal >= endVal) {
        alert("Please ensure that the start date comes after the end date.");
        return;
    }
    const start = new Date(startVal + "T00:00:00");
    const end = new Date(endVal + "T23:59:59");
    const times = document
        .getElementById("times")
        .value.split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    const sundays = getSundays(start, end).map((d) => fmtMMDDYY(d));

    if (sundays.length === 0) {
        alert("There are no Sundays within this length of dates.");
        return;
    }

    const masses = [];
    sundays.forEach((d) => {
        times.forEach((t) => masses.push(d + "\n" + t));
    });

    const rows = batched(masses, 4);
    // pad last row to 4 columns
    if (rows.length && rows[rows.length - 1].length < 4) {
        while (rows[rows.length - 1].length < 4) rows[rows.length - 1].push("");
    }

    let csv = "";
    rows.forEach((row) => {
        csv += row.map(csvEscape).join(",") + "\r\n";
    });

    const filename = `sundays_${startVal}_through_${endVal}.csv`;
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});
