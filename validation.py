def validate_order(order: dict) -> bool:
    """Very small validation helper used by the API.
    The real project may perform schema checks, but for the current
    debugging environment we only check that the order is a dictionary and
    contains a numeric transaction_id.  This keeps the application
    functional without pulling in a full JSON‑schema validator.
    """
    if not isinstance(order, dict):
        return False
    # Basic required fields
    if 'transaction_id' not in order:
        return False
    try:
        int(order['transaction_id'])
    except Exception:
        return False
    return True
