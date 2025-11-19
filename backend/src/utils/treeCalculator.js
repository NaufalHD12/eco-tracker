/**
 * Tree Planting Calculation Utilities
 * Trees are earned only through reduction efforts, not consumption
 */

/**
 * Calculate trees earned from monthly emission savings
 * Formula: floor((Target - Actual Emission) / 10)
 * Each 10kg CO2e saved = 1 tree
 * @param {number} targetEmission - User's monthly target
 * @param {number} actualEmission - User's actual monthly emission
 * @returns {number} - Number of trees earned
 */
export const calculateMonthlySavingsTrees = (targetEmission, actualEmission) => {
  const savings = targetEmission - actualEmission;

  if (savings <= 0) {
    return 0; // No savings = no trees
  }

  // Each 10kg CO2e saved = 1 tree, floor to whole numbers
  return Math.floor(savings / 10);
};

/**
 * Validate tree calculation inputs
 * @param {number} targetEmission
 * @param {number} actualEmission
 * @returns {object} - {valid: boolean, error: string}
 */
export const validateTreeCalculation = (targetEmission, actualEmission) => {
  if (targetEmission < 0 || actualEmission < 0) {
    return {valid: false, error: 'Emissions cannot be negative'};
  }

  if (!Number.isFinite(targetEmission) || !Number.isFinite(actualEmission)) {
    return {valid: false, error: 'Emissions must be valid numbers'};
  }

  return {valid: true};
};

/**
 * Get tree reward based on challenge difficulty
 * Used as default when creating new challenges
 * @param {string} difficulty - 'Easy', 'Medium', or 'Hard'
 * @returns {number} - Number of trees to reward
 */
export const getDifficultyBasedTrees = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return 1;
    case 'Medium':
      return 3;
    case 'Hard':
      return 5;
    default:
      return 0;
  }
};

/**
 * Create tree earning notification message
 * @param {number} treeCount - Number of trees earned
 * @param {string} reason - 'savings' or 'challenge'
 * @returns {string} - User-friendly notification message
 */
export const createTreeEarningMessage = (treeCount, reason) => {
  if (treeCount === 0) {
    return null; // No message for zero trees
  }

  const treeText = treeCount === 1 ? 'tree' : 'trees';
  const treeEmojis = '🌳'.repeat(Math.min(treeCount, 5));

  switch (reason) {
    case 'savings':
      return `Congratulations! You earned ${treeCount} ${treeText} ${treeEmojis} by staying under your monthly target. Keep reducing emissions!`;
    case 'challenge':
      return `Challenge completed! You earned ${treeCount} ${treeText} ${treeEmojis} for your achievement!`;
    default:
      return `You earned ${treeCount} ${treeText} ${treeEmojis}!`;
  }
};
