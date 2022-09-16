from datetime import datetime
from dateutil.relativedelta import relativedelta

def set_default_date(filters):
    # TODO remove date end quick fix
    if 'published_after' not in filters:
        # default: 40 years ago
        filters['published_after'] = datetime.now() - relativedelta(years=40)
    else:
        date_end = filters['published_after'].find("T")
        filters['published_after'] = datetime.strptime(filters['published_after'][:date_end], '%Y-%m-%d')
    if 'published_before' not in filters:
        # default: now
        filters['published_before'] = datetime.now()
    else:
        date_end = filters['published_before'].find("T")
        filters['published_before'] = datetime.strptime(filters['published_before'][:date_end], '%Y-%m-%d')
    return filters