import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface HealthPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: HealthPluginSettings = {
  mySetting: 'default'
}

class HealthTrackerModal extends Modal {
  plugin: HealthPlugin;

  constructor(app: App, plugin: HealthPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Track your activity here.');

    // Form to input activity data
    const form = contentEl.createEl('form');

    form.createEl('h3', { text: 'Register Physical Activity' });

    form.createEl('label', { text: 'Type of Exercise' });
    const exerciseType = form.createEl('input', { type: 'text' });

    form.createEl('label', { text: 'Duration (minutes)' });
    const duration = form.createEl('input', { type: 'number' });

    form.createEl('label', { text: 'Intensity' });
    const intensity = form.createEl('select');
    ['Low', 'Medium', 'High'].forEach(level => {
      intensity.createEl('option', { text: level, value: level });
    });

    form.createEl('label', { text: 'Calories Burned' });
    const calories = form.createEl('input', { type: 'number' });

    const submitButton = form.createEl('button', { text: 'Save' });
    submitButton.type = 'submit';

    form.onsubmit = async (event) => {
      event.preventDefault();

      const data = {
        type: exerciseType.value,
        duration: duration.value,
        intensity: intensity.value,
        calories: calories.value
      };

      this.plugin.saveActivityData(data);
      new Notice('Activity Saved!');

      this.close();
    };
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class SleepTrackerModal extends Modal {
  plugin: HealthPlugin;

  constructor(app: App, plugin: HealthPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Track your sleep here.');

    // Form to input sleep data
    const form = contentEl.createEl('form');

    form.createEl('h3', { text: 'Register Sleep' });

    form.createEl('label', { text: 'Hours Slept' });
    const hoursSlept = form.createEl('input', { type: 'number' });

    form.createEl('label', { text: 'Quality of Sleep' });
    const quality = form.createEl('select');
    ['Poor', 'Fair', 'Good', 'Excellent'].forEach(level => {
      quality.createEl('option', { text: level, value: level });
    });

    const submitButton = form.createEl('button', { text: 'Save' });
    submitButton.type = 'submit';

    form.onsubmit = async (event) => {
      event.preventDefault();

      const data = {
        hours: hoursSlept.value,
        quality: quality.value
      };

      this.plugin.saveSleepData(data);
      new Notice('Sleep Data Saved!');

      this.close();
    };
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class NutritionTrackerModal extends Modal {
  plugin: HealthPlugin;

  constructor(app: App, plugin: HealthPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Track your nutrition here.');

    // Form to input nutrition data
    const form = contentEl.createEl('form');

    form.createEl('h3', { text: 'Register Nutrition' });

    form.createEl('label', { text: 'Food' });
    const food = form.createEl('input', { type: 'text' });

    form.createEl('label', { text: 'Calories' });
    const calories = form.createEl('input', { type: 'number' });

    form.createEl('label', { text: 'Macros (Carbs, Protein, Fat)' });
    const macros = form.createEl('input', { type: 'text' });

    const submitButton = form.createEl('button', { text: 'Save' });
    submitButton.type = 'submit';

    form.onsubmit = async (event) => {
      event.preventDefault();

      const data = {
        food: food.value,
        calories: calories.value,
        macros: macros.value
      };

      this.plugin.saveNutritionData(data);
      new Notice('Nutrition Data Saved!');

      this.close();
    };
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

class HealthSettingTab extends PluginSettingTab {
  plugin: HealthPlugin;

  constructor(app: App, plugin: HealthPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    
    containerEl.createEl('h2', { text: 'Settings for Health Plugin' });

    new Setting(containerEl)
      .setName('Sample Setting')
      .setDesc('A sample setting for the plugin.')
      .addText(text => text
        .setPlaceholder('Enter your setting')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}

export default class HealthPlugin extends Plugin {
  settings: HealthPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon('heart', 'Open Health Tracker', () => {
      new HealthTrackerModal(this.app, this).open();
    });

    this.addCommand({
      id: 'open-sleep-tracker',
      name: 'Open Sleep Tracker',
      callback: () => {
        new SleepTrackerModal(this.app, this).open();
      }
    });

    this.addCommand({
      id: 'open-nutrition-tracker',
      name: 'Open Nutrition Tracker',
      callback: () => {
        new NutritionTrackerModal(this.app, this).open();
      }
    });

    this.addSettingTab(new HealthSettingTab(this.app, this));

    this.registerCommands();
  }

  onunload() {
    console.log('Unloading Health Tracker Plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerCommands() {
    this.addCommand({
      id: 'insert-activity-note',
      name: 'Insert Activity Note',
      editorCallback: (editor, view) => {
        const activityNote = `## Activity Log
- **Type**: 
- **Duration**: 
- **Intensity**: 
- **Calories Burned**: `;
        editor.replaceRange(activityNote, editor.getCursor());
      }
    });

    this.addCommand({
      id: 'insert-sleep-note',
      name: 'Insert Sleep Note',
      editorCallback: (editor, view) => {
        const sleepNote = `## Sleep Log
- **Hours Slept**: 
- **Quality of Sleep**: `;
        editor.replaceRange(sleepNote, editor.getCursor());
      }
    });

    this.addCommand({
      id: 'insert-nutrition-note',
      name: 'Insert Nutrition Note',
      editorCallback: (editor, view) => {
        const nutritionNote = `## Nutrition Log
- **Food**: 
- **Calories**: 
- **Macros (Carbs, Protein, Fat)**: `;
        editor.replaceRange(nutritionNote, editor.getCursor());
      }
    });
  }

  saveActivityData(data: any) {
    this.saveDataToFile('activity-log.md', data);
  }

  saveSleepData(data: any) {
    this.saveDataToFile('sleep-log.md', data);
  }

  saveNutritionData(data: any) {
    this.saveDataToFile('nutrition-log.md', data);
  }

  async saveDataToFile(filename: string, data: any) {
    const file = this.app.vault.getAbstractFileByPath(filename) as TFile;
    if (file) {
      const content = await this.app.vault.read(file);
      const updatedContent = content + `\n${JSON.stringify(data)}`;
      await this.app.vault.modify(file, updatedContent);
    } else {
      await this.app.vault.create(filename, JSON.stringify(data));
    }
  }
}
