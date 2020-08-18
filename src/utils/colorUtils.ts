import * as COLORS from '../constants/Colors'

// accepts a boxColor as denoted from the COLORS constant and returns
// the relevant target number as denoted in the COLORS constant
export const boxColorToTargetColor = (boxColor: number) => {
  switch (boxColor) {
    case COLORS.BOX_COLOR_ORANGE:
      return COLORS.TARGET_COLOR_ORANGE
    case COLORS.BOX_COLOR_RED:
      return COLORS.TARGET_COLOR_RED
    case COLORS.BOX_COLOR_BLUE:
      return COLORS.TARGET_COLOR_BLUE
    case COLORS.BOX_COLOR_GREEN:
      return COLORS.TARGET_COLOR_GREEN
    case COLORS.BOX_COLOR_GREY:
      return COLORS.TARGET_COLOR_GREY
    default:
      return COLORS.TARGET_COLOR_ORANGE
  }
}
