import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import MobileSidebar from '../components/MobileSidebar';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Example settings
  const [settings, setSettings] = useState({
    fraudExplainer: {
      confidenceThreshold: 70,
      maxResponseTime: 3,
      enablePiiMasking: true,
      modelVersion: 'mistral',
    },
    riskProfileGenerator: {
      confidenceThreshold: 75,
      maxResponseTime: 2,
      enableAutoUpdates: true,
      modelVersion: 'phi3',
    },
  });

  const handleSettingChange = (agent: string, setting: string, value: any) => {
    setSettings({
      ...settings,
      [agent]: {
        ...settings[agent as keyof typeof settings],
        [setting]: value,
      },
    });
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    setSuccessMessage('');

    // Simulate API call to save settings
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Settings saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1500);
  };

  return (
    <>
      <MobileSidebar />
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Fraud Explainer Agent</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure the fraud explainer agent settings
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fraudConfidence"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confidence Threshold (%)
                </label>
                <input
                  type="range"
                  id="fraudConfidence"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.fraudExplainer.confidenceThreshold}
                  onChange={(e) =>
                    handleSettingChange(
                      'fraudExplainer',
                      'confidenceThreshold',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">50%</span>
                  <span className="text-xs font-medium">
                    {settings.fraudExplainer.confidenceThreshold}%
                  </span>
                  <span className="text-xs text-gray-500">95%</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="fraudResponseTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Response Time (seconds)
                </label>
                <input
                  type="number"
                  id="fraudResponseTime"
                  min="1"
                  max="10"
                  value={settings.fraudExplainer.maxResponseTime}
                  onChange={(e) =>
                    handleSettingChange(
                      'fraudExplainer',
                      'maxResponseTime',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="fraudModel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Model Version
                </label>
                <select
                  id="fraudModel"
                  value={settings.fraudExplainer.modelVersion}
                  onChange={(e) =>
                    handleSettingChange('fraudExplainer', 'modelVersion', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mistral">Mistral</option>
                  <option value="phi3">Phi-3</option>
                  <option value="llama3">Llama 3</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePiiMasking"
                  checked={settings.fraudExplainer.enablePiiMasking}
                  onChange={(e) =>
                    handleSettingChange('fraudExplainer', 'enablePiiMasking', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enablePiiMasking" className="ml-2 block text-sm text-gray-700">
                  Enable PII Masking
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Risk Profile Generator</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure the risk profile generator agent settings
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="riskConfidence"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confidence Threshold (%)
                </label>
                <input
                  type="range"
                  id="riskConfidence"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.riskProfileGenerator.confidenceThreshold}
                  onChange={(e) =>
                    handleSettingChange(
                      'riskProfileGenerator',
                      'confidenceThreshold',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">50%</span>
                  <span className="text-xs font-medium">
                    {settings.riskProfileGenerator.confidenceThreshold}%
                  </span>
                  <span className="text-xs text-gray-500">95%</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="riskResponseTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Response Time (seconds)
                </label>
                <input
                  type="number"
                  id="riskResponseTime"
                  min="1"
                  max="10"
                  value={settings.riskProfileGenerator.maxResponseTime}
                  onChange={(e) =>
                    handleSettingChange(
                      'riskProfileGenerator',
                      'maxResponseTime',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="riskModel" className="block text-sm font-medium text-gray-700 mb-1">
                  Model Version
                </label>
                <select
                  id="riskModel"
                  value={settings.riskProfileGenerator.modelVersion}
                  onChange={(e) =>
                    handleSettingChange('riskProfileGenerator', 'modelVersion', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mistral">Mistral</option>
                  <option value="phi3">Phi-3</option>
                  <option value="llama3">Llama 3</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAutoUpdates"
                  checked={settings.riskProfileGenerator.enableAutoUpdates}
                  onChange={(e) =>
                    handleSettingChange(
                      'riskProfileGenerator',
                      'enableAutoUpdates',
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableAutoUpdates" className="ml-2 block text-sm text-gray-700">
                  Enable Automatic Updates
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">System Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Configure global system settings</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="apiEndpoint"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  API Endpoint
                </label>
                <input
                  type="text"
                  id="apiEndpoint"
                  value="https://api.fintech-ai.example.com/v1"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="loggingLevel"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Logging Level
                </label>
                <select
                  id="loggingLevel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="info"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          {successMessage && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm flex items-center">
              <CheckCheck className="h-4 w-4 mr-2" />
              {successMessage}
            </div>
          )}

          <button
            type="button"
            className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Settings;
