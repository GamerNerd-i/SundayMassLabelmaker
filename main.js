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

function getSundays(start, end) {
    // start/end are Date objects (midnight)
    const sundays = [];
    const day = start.getDay(); // 0 = Sunday
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    let current = new Date(start);
    current.setDate(current.getDate() + daysUntilSunday);
    while (current <= end) {
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

document.getElementById("generate").addEventListener("click", () => {
    const startVal = document.getElementById("start").value;
    const endVal = document.getElementById("end").value;
    if (!startVal || !endVal) {
        alert("Pick start and end dates");
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
