from datetime import date, timedelta
import csv
from itertools import batched

# Original script kept for archival and reference purposes.

START_DATE = date(2026, 5, 10)  # Enter in YYYY, MM, DD format
END_DATE = date(2027, 5, 10)  # Enter in YYYY, MM, DD format
TIMES = ["10 AM", "8 PM"]  # Enter mass times

# Finds every sunday within the given START_DATE and END_DATE
days_until_sunday = (6 - START_DATE.weekday()) % 7
current = START_DATE + timedelta(days=days_until_sunday)
sundays = []
while current <= END_DATE:
    sundays.append(current.strftime("%m/%d/%y"))
    current += timedelta(days=7)

# Places text in to date-time labels
masses = []
for date in sundays:
    for time in TIMES:
        masses.append(f"{date}\n{time}")

# Place masses into groups of 4 to be fed into CSV.
masses = list(batched(masses, 4))

# Creates the actual labels and saves them to a CSV.
with open(f"sundays_{START_DATE}_through_{END_DATE}.csv", "w", newline="") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerows(masses)

# Close the file
csv_file.close
