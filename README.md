# 🌱 Vegan Menu Marker

A Chrome extension that automatically marks vegan dishes on Google Maps restaurant menus with a 🌱 emoji.

## Features

- **Automatic Detection**: Scans menu items for non-vegan ingredients (dairy, eggs, meat, fish)
- **Smart Recognition**: Identifies vegan substitutes like "vegan cheese", "jackfruit", "Beyond Meat"
- **Toggle Control**: Easy on/off switch in the popup
- **Conservative Approach**: Only marks items as vegan when confident - no false positives

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension folder
5. Visit any Google Maps restaurant page to see it in action

## How It Works

The extension analyzes menu item names and descriptions for:

**Non-vegan ingredients detected:**
- Dairy: cheese, milk, butter, cream, yogurt
- Eggs: eggs, mayonnaise, aioli
- Meat: beef, pork, chicken, turkey, lamb
- Seafood: fish, shrimp, crab, lobster
- Other: honey, gelatin, whey, casein

**Vegan substitutes recognized:**
- Plant-based alternatives: vegan cheese, vegan meat, Beyond Meat, Impossible
- Plant proteins: tofu, tempeh, seitan, jackfruit
- Plant milks: almond, soy, oat, coconut milk

## Usage

1. Navigate to a restaurant on Google Maps
2. Click on the restaurant to view its menu
3. Vegan dishes will automatically be marked with 🌱
4. Use the extension popup to toggle marking on/off

## Contributing

Contributions welcome! Please help improve ingredient detection:

- **Missing ingredients**: Report non-vegan ingredients we're not catching
- **False positives**: Report items incorrectly marked as vegan
- **New vegan brands**: Suggest plant-based brands to recognize

## Privacy

- No data collection or tracking
- Works entirely locally in your browser
- Only activates on Google Maps pages

## License

MIT License - feel free to modify and distribute

## Feedback

Found an issue? Email: hetanthakkar5@gmail.com

---

*This extension errs on the side of caution - when in doubt, it won't mark an item as vegan. Always verify ingredients for strict dietary requirements.*