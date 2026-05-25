'use strict'
// electron/preload.js — Context bridge stub
// Requirements: 3.5
//
// contextBridge intentionally exposes no APIs to the renderer.
// All app logic is self-contained in the React bundle.
// This stub is a safe extension point for future IPC additions
// without requiring architectural changes.

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {})
