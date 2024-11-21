import { Lights } from './Lights'

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Lights className="absolute inset-0 z-0" />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-moveUp">
          Welcome to Our Website
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-moveUp">
          Discover amazing features and services
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded animate-appear">
          Get Started
        </button>
      </div>
    </div>
  )
}