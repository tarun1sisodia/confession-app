"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import {
  FONT_PRESETS,
  LAYOUT_MODES,
  TEXT_TONE_PRESETS,
  THEME_PRESETS,
  applyUiSettings,
  getPresetById
} from "@/lib/customization";
import { DEFAULT_UI_SETTINGS, getUiSettings, saveUiSettings } from "@/lib/storage";

export function SettingsScreen() {
  const [settings, setSettings] = useState({ theme: "system", revealEnabled: true });
  const [uiSettings, setUiSettings] = useState(getUiSettings());
  const activePreset = useMemo(() => getPresetById(uiSettings.presetId), [uiSettings.presetId]);

  useEffect(() => {
    getSettings()
      .then((data) => setSettings(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const resolvedTheme =
      settings.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : settings.theme;
    document.documentElement.dataset.theme = resolvedTheme;
    applyUiSettings(uiSettings, resolvedTheme);
  }, [settings.theme, uiSettings]);

  async function persistAppSettings(nextSettings) {
    setSettings(nextSettings);
    try {
      await updateSettings(nextSettings);
    } catch {}
  }

  function persistUiSettings(patch) {
    const next = saveUiSettings({ ...uiSettings, ...patch });
    setUiSettings(next);
  }

  return (
    <main className="settings-page">
      <section className="settings-shell">
        <div className="settings-page-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h1>Make Confessly look exactly how you want.</h1>
          </div>
          <Link href="/" className="ghost-button text-link-button">
            Back
          </Link>
        </div>

        <section className="settings-panel">
          <div className="settings-block">
            <p className="eyebrow">Core controls</p>
            <div className="settings-row">
              {["light", "dark", "system"].map((mode) => (
                <button
                  key={mode}
                  className={settings.theme === mode ? "topic-chip active" : "topic-chip"}
                  onClick={() => persistAppSettings({ ...settings, theme: mode })}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="settings-row">
              <button
                className={settings.revealEnabled ? "topic-chip active" : "topic-chip"}
                onClick={() => persistAppSettings({ ...settings, revealEnabled: !settings.revealEnabled })}
              >
                Blur {settings.revealEnabled ? "enabled" : "disabled"}
              </button>
            </div>
          </div>

          <div className="settings-block">
            <p className="eyebrow">Theme presets</p>
            <p className="settings-help">
              50 preset combinations are available. Current preset: <strong>{activePreset.label}</strong>.
            </p>
            <div className="preset-grid">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={uiSettings.presetId === preset.id ? "preset-card active" : "preset-card"}
                  onClick={() => persistUiSettings({ presetId: preset.id })}
                >
                  <span className="preset-label">{preset.label}</span>
                  <span className="preset-meta">{preset.accentId} / {preset.surfaceId}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-grid-two">
            <div className="settings-block">
              <p className="eyebrow">Typography</p>
              <div className="settings-row">
                {FONT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={uiSettings.font === preset.id ? "topic-chip active" : "topic-chip"}
                    onClick={() => persistUiSettings({ font: preset.id })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-block">
              <p className="eyebrow">Layout mode</p>
              <div className="settings-row">
                {LAYOUT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    className={uiSettings.layoutMode === mode.id ? "topic-chip active" : "topic-chip"}
                    onClick={() => persistUiSettings({ layoutMode: mode.id })}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-block">
              <p className="eyebrow">Text tone</p>
              <div className="settings-row">
                {TEXT_TONE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={uiSettings.textTone === preset.id ? "topic-chip active" : "topic-chip"}
                    onClick={() => persistUiSettings({ textTone: preset.id })}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-grid-two">
            <label className="slider-row">
              <span className="settings-label">Text size</span>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.05"
                value={uiSettings.textScale}
                onChange={(event) => persistUiSettings({ textScale: Number(event.target.value) })}
              />
              <strong>{uiSettings.textScale.toFixed(2)}x</strong>
            </label>

            <label className="slider-row">
              <span className="settings-label">UI roundness</span>
              <input
                type="range"
                min="0.8"
                max="1.35"
                step="0.05"
                value={uiSettings.radius}
                onChange={(event) => persistUiSettings({ radius: Number(event.target.value) })}
              />
              <strong>{uiSettings.radius.toFixed(2)}x</strong>
            </label>

            <label className="slider-row">
              <span className="settings-label">Nav size</span>
              <input
                type="range"
                min="0.78"
                max="1.05"
                step="0.03"
                value={uiSettings.navScale ?? 0.9}
                onChange={(event) => persistUiSettings({ navScale: Number(event.target.value) })}
              />
              <strong>{(uiSettings.navScale ?? 0.9).toFixed(2)}x</strong>
            </label>
          </div>

          <section className="preview-card">
            <p className="eyebrow">Live preview</p>
            <h2>Confessly preview card</h2>
            <p className="preview-copy">
              This preview reflects your selected theme preset, font style, text tone, and sizing.
            </p>
            <div className="preview-actions">
              <button className="primary-button">Primary button</button>
              <button className="secondary-button">Secondary button</button>
            </div>
          </section>

          <div className="settings-actions">
            <button className="secondary-button" onClick={() => persistUiSettings(DEFAULT_UI_SETTINGS)}>
              Reset visual customization
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
