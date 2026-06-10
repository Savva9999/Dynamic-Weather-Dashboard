export function getTempColor(temp) {
    if (temp >= 25) return "#ff3b30"
    if (temp >= 15) return "#ff9500"
    if (temp >= 0) return "#34c759"
    if (temp >= -10) return "#0a84ff"

    return "#5ac8fa"
}

export function getTheme(temp) {
    if (temp >= 25) return "hot"
    if (temp >= 15) return "warm"
    if (temp >= 0) return "normal"
    if (temp >= -10) return "cold"

    return "freezing"
}