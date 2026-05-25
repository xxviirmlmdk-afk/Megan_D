import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Task 6.4: Unit test for Android Gradle configuration
// Requirements: 6.5

describe('Android Gradle configuration', () => {
  it('android/variables.gradle sets minSdkVersion = 24', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('minSdkVersion = 24')
  })

  it('android/variables.gradle sets compileSdkVersion = 34', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('compileSdkVersion = 34')
  })

  it('android/variables.gradle sets targetSdkVersion = 34', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('targetSdkVersion = 34')
  })
})
