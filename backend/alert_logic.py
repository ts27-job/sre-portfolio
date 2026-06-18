def evaluate_rule(value, operator, threshold):

    if operator == ">":
        return value > threshold

    elif operator == "<":
        return value < threshold

    elif operator == ">=":
        return value >= threshold

    elif operator == "<=":
        return value <= threshold

    return False