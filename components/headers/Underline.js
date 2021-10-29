import React from 'react'
import Link from 'next/link'
import DarkModeToggle from 'components/widgets/DarkModeToggle'

const Header = ({dark}) => {
  return (
    <header className="px-4 md:px-8 pt-2 md:pt-6">
      <nav className="border-b border-gray-200 dark:border-gray-500">
        <div className="flex flex-row justify-between items-end mx-4 lg:mx-8 -mb-px">
          <Link href="/">
            <a>
              <h2 className="flex flex-row items-center text-xl md:text-2xl pb-0.5 hover:pb-0 hover:border-b-2 dark:hover:border-white hover:border-black font-bold">
                TV-Guide
              </h2>
            </a>
          </Link>
          <ul className="block font-medium text-base lg:text-xl lg:px-12 tracking-wide">
            <li className="inline-block -mb-1 mx-2 h-6 w-6">
              <DarkModeToggle />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Header

