"""
Medline dates are specified to be unspecified. Therefore, parsing them
involves doing our best based upon observed values.
"""
import datetime


SEASONS = ["winter", "spring", "summer", "autumn", "fall"]
MONTHS = [
    ("jan", 31),
    ("feb", 29),
    ("mar", 31),
    ("apr", 30),
    ("may", 31),
    ("jun", 30),
    ("jul", 31),
    ("aug", 31),
    ("sep", 30),
    ("oct", 31),
    ("nov", 30),
    ("dec", 31),
]
ABBREV_MONTH_NAMES_LOWER = [abbrev for abbrev, _ in MONTHS]
MAX_DAYS_IN_MONTH = [max_days for _, max_days in MONTHS]


class MedlineDateParseException(Exception):
    """ Special exception to mark exceptions with parsing a medline date. """
    pass


def parse_month(text: str) -> int:
    """
    Parses either a number in the range [1, 12], or a 3-letter month
    abbreviation and converts it to a number in the range [1, 12].
    """
    try:
        month = int(text)
        if month < 1 or month > 12:
            raise MedlineDateParseException(f"Unknown month: {text}")

        return month
    except ValueError:
        pass

    try:
        return ABBREV_MONTH_NAMES_LOWER.index(text.lower()) + 1
    except ValueError:
        raise MedlineDateParseException(f"Unknown month: {text}")


def parse_medline_date(medline_date: str) -> datetime.date:
    """
    Does its best to parse a <MedlineDate> value.
    The format of these dates is specified to be unspecified.
    Therefore, we can only try our best based on example values.

    Example Values:
     * 1998 Dec-1999 Jan   ->  1998 Dec
     * 2000 Spring-Summer  ->  2000 Spring
     * 2000 Nov-Dec        ->  2000 Nov
     * 2000 Dec 23- 30     ->  2000 Dec 23
     * Summer 2000         ->  2000
     * 1975, 1977          ->  1975
     * TODO: 1782 Oct-Dec  ->  1782 Oct
    """
    # Since these dates don't follow a standard, we want to fail with extra information to help update this function.
    try:
        medline_date = medline_date.strip()
        if len(medline_date) == 0:
            raise MedlineDateParseException("The date is empty or only whitespace")

        # Split date ranges into their two halves. (e.g. "2000 Nov-Dec" -> ["2000 Nov", "Dec"])
        if "-" in medline_date:
            dash_index = medline_date.index("-")
            try:
                # First try parse the left-hand side.
                return parse_medline_date(medline_date[:dash_index])
            except MedlineDateParseException:
                # If it fails, try parse the right-hand side. (e.g. "Spring-Summer 2000" -> "Summer 2000")
                return parse_medline_date(medline_date[dash_index + 1:])

        # Split date lists into their elements. (e.g. "1975, 1977"  ->  ["1975", "1977"])
        if "," in medline_date:
            elements = medline_date.split(",")

            # Prefer earlier date elements.
            for index, element in enumerate(elements):
                is_last = (index == len(elements) - 1)
                try:
                    return parse_medline_date(element)
                except MedlineDateParseException as e:
                    if is_last:
                        raise e
                    # Try the remaining elements.
                    continue

            raise MedlineDateParseException("This shouldn't be possible...")

        # Split the date into whitespace-separated parts.
        parts = medline_date.split()

        # The first part may be a season... which are really unhelpful.
        if parts[0].lower() in SEASONS:
            parts = parts[1:]
            if len(parts) == 0:
                raise MedlineDateParseException("Date was only a season name...")

        # We always expect YYYY to start.
        year = int(parts[0])
        if year < 1500:
            raise MedlineDateParseException("Year before 1500 is unlikely to be correct...")
        if len(parts) == 1:
            return datetime.date(year, 1, 1)

        # Next, we expect a month or season.
        try:
            month = parse_month(parts[1])
            if len(parts) == 2:
                return datetime.date(year, month, 1)
        except MedlineDateParseException:
            # Probably a season, ignore the rest and just use the year.
            # We would have to know whether the date was from the northern
            # or southern hemisphere to make sense of seasons...
            return datetime.date(year, 1, 1)

        # Next, we expect a day.
        try:
            day = int(parts[2])
            max_days = MAX_DAYS_IN_MONTH[month - 1]
            if day < 1 or day > max_days:
                # Ignore invalid days.
                return datetime.date(year, month, 1)
        except ValueError:
            # Ignore invalid days.
            return datetime.date(year, month, 1)

        # Ignore anything else in the string, and just use what we have gathered so far.
        return datetime.date(year, month, day)
    except Exception as e:
        raise MedlineDateParseException(f"Unable to parse Medline date: \"{medline_date}\"") from e
