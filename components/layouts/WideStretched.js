import React from 'react'

export const Row = (props) => <div {...props} />
export const Main = ({className, ...props}) => <main className={`flex-1 ${className}`} {...props} />

// https://tailwindcss.com/docs/container
export const Container = ({className, ...props}) => <div className={`container xl:max-w-screen-xl ${className}`} {...props} />

  const Layout = ({className, ...props}) => <div className=""><div className={`flex flex-col min-h-screen ${className}`} {...props}/></div>
export default Layout

