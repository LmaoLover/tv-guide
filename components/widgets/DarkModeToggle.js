// https://codesandbox.io/s/headlessuireact-switch-example-y40i1

import React from 'react'
import { Switch } from "@headlessui/react"
import { useDarkMode } from 'components/util/useDarkMode'

const DarkModeToggle = () => {
  const [isDark, toggleDarkMode] = useDarkMode() 

  return (
    <Switch.Group as="div" className="flex items-center space-x-4 overflow-hidden sm:overflow-visible">
      <Switch.Label>Dark:</Switch.Label>
      <Switch
        as="button"
        checked={isDark}
        onChange={toggleDarkMode}
        className="dark:bg-indigo-600 bg-gray-200 relative inline-flex shrink-0 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-hidden focus:shadow-outline">
        {({ checked }) => (
          <span
            className="dark:translate-x-5 translate-x-0 inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full"
          />
        )}
      </Switch>
    </Switch.Group>
  )
}

export default DarkModeToggle

