import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  CheckCircle,
  Star,
  Sparkles,
  TrendingDown,
  TreePine,
  ArrowRight,
  Calculator,
  Car,
  Zap,
} from "lucide-react";

export const LandingPage = () => {
  // --- State Management ---
  const [textIndex, setTextIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [calculatorValue, setCalculatorValue] = useState(50); // Default 50kg saving
  const [activeFeature, setActiveFeature] = useState(0);
  const [joinedChallenges, setJoinedChallenges] = useState([]);

  const descriptions = [
    "Reduce your environmental impact through daily activities.",
    "Track emissions, complete challenges, take quizzes, and earn real trees.",
    "Learn, play, and make every action count toward a sustainable future.",
  ];

  // --- Features Data ---
  const features = [
    {
      id: 0,
      icon: <Activity className="w-6 h-6" />,
      title: "Smart Logging",
      desc: "Log transport, food, and energy. We calculate the CO2e automatically.",
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
      visual: (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Car size={16} />
              </div>
              <span className="text-sm font-medium">Commute to Work</span>
            </div>
            <span className="text-sm font-bold text-gray-500">2.4 kg CO₂</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                <Zap size={16} />
              </div>
              <span className="text-sm font-medium">AC Usage (4h)</span>
            </div>
            <span className="text-sm font-bold text-gray-500">1.8 kg CO₂</span>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Visual Analytics",
      desc: "See where your emissions come from with beautiful interactive charts.",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      visual: (
        <div className="flex items-end justify-center gap-2 h-32 w-full px-4 pb-2 animate-in zoom-in duration-500">
          <div className="w-8 bg-blue-200 dark:bg-blue-800 h-[40%] rounded-t-md relative group hover:h-[50%] transition-all">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-1 rounded">
              Food
            </div>
          </div>
          <div className="w-8 bg-blue-400 dark:bg-blue-600 h-[70%] rounded-t-md relative group hover:h-[80%] transition-all">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-1 rounded">
              Trans
            </div>
          </div>
          <div className="w-8 bg-blue-600 dark:bg-blue-400 h-[50%] rounded-t-md relative group hover:h-[60%] transition-all">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-1 rounded">
              Shop
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      icon: <TreePine className="w-6 h-6" />,
      title: "Earn Trees",
      desc: "Hit your reduction targets and we'll plant real trees in your name.",
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      visual: (
        <div className="flex flex-col items-center justify-center animate-in spin-in-12 duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
            <TreePine className="w-20 h-20 text-green-600 drop-shadow-lg" />
          </div>
          <div className="mt-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            +1 Tree Earned!
          </div>
        </div>
      ),
    },
    {
      id: 3,
      icon: <Brain className="w-6 h-6" />,
      title: "Learn & Play",
      desc: "Take engaging quizzes to learn about sustainability and earn points & badges.",
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      visual: (
        <div className="space-y-4 w-full p-2 animate-in slide-in-from-left-2 duration-500">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-bold">Sustainability Quiz</span>
              </div>
              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full dark:bg-purple-900 dark:text-purple-300">
                650 pts
              </div>
            </div>
            <h4 className="text-sm font-semibold mb-2">What is the main greenhouse gas responsible for climate change?</h4>
            <div className="space-y-2">
              {["Carbon Dioxide (CO₂)", "Oxygen (O₂)", "Nitrogen (N₂)", "Methane (CH₄)"].map((option, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                  <span className="text-xs">{option}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">Question 3/12</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-16 bg-gray-100 rounded-full h-1">
                  <div className="bg-green-500 h-1 rounded-full w-3/12"></div>
                </div>
                <span>25%</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // --- Handlers ---

  const handleMouseMove = (e) => {
    // Calculate mouse position relative to window center for parallax
    const x = (e.clientX - window.innerWidth / 2) / 50;
    const y = (e.clientY - window.innerHeight / 2) / 50;
    setMousePos({ x, y });
  };

  const handleJoinChallenge = (id) => {
    if (!joinedChallenges.includes(id)) {
      setJoinedChallenges([...joinedChallenges, id]);
    }
  };

  // --- Effects ---

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextIndex((prev) => (prev + 1) % descriptions.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [textIndex, descriptions.length]);

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-3xl transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`,
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
          }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-4 h-4 bg-yellow-400 rounded-full opacity-20 animate-pulse"
          style={{
            transform: `translate(${mousePos.x * 1}px, ${mousePos.y * 1}px)`,
          }}
        />
      </div>

      {/* --- Navigation (Simple) --- */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-green-600 text-white p-1.5 rounded-lg">
            <Leaf size={20} />
          </div>
          EcoTrack
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a
            href="#features"
            className="hover:text-green-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#calculator"
            className="hover:text-green-600 transition-colors"
          >
            Impact
          </a>
          <a
            href="#challenges"
            className="hover:text-green-600 transition-colors"
          >
            Challenges
          </a>
          <Link
            to="/login"
            className="hover:text-green-600 transition-colors"
          >
            Quizzes
          </Link>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="text-sm font-medium hover:text-green-600 py-2 px-3"
          >
            Login
          </Link>
          <Link to="/register">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-8 animate-fade-in border border-green-100 dark:border-green-800">
            <Sparkles size={16} />
            <span>New: Global Reforestation Challenge Live!</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white leading-tight">
            Turn your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-400">
              Carbon Footprint
            </span>
            <br />
            Into{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-500">
              Forests.
            </span>
          </h1>

          <div className="h-16 mb-8 flex items-center justify-center">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-all duration-500 ease-in-out">
              {descriptions[textIndex]}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link to="/register">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full bg-green-600 hover:bg-green-700 hover:scale-105 transition-all shadow-lg shadow-green-600/20"
              >
                Start Tracking Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Interactive Impact Calculator --- */}
      <section
        id="calculator"
        className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
                <Calculator size={20} />
                <span>Impact Simulator</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                How much can you save?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Adjust the slider to see how small monthly reductions translate
                into real-world environmental impact.
              </p>

              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Reduction Target</span>
                  <span className="font-bold text-green-600">
                    {calculatorValue} kg CO₂e
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={calculatorValue}
                  onChange={(e) => setCalculatorValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Small change</span>
                  <span>Massive impact</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-white p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10 space-y-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Potential Trees Earned
                  </div>
                  <div className="text-5xl font-bold text-green-400 flex items-baseline gap-2">
                    {Math.floor(calculatorValue / 10)}
                    <span className="text-lg font-normal text-gray-400">
                      trees / mo
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-800"></div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Equivalent to driving
                  </div>
                  <div className="text-3xl font-bold text-blue-400 flex items-baseline gap-2">
                    {Math.floor(calculatorValue * 2.4)}
                    <span className="text-lg font-normal text-gray-400">
                      fewer miles
                    </span>
                  </div>
                </div>

                <Link to="/register" className="block mt-4">
                  <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                    Make it Happen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Interactive Features Tabs --- */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tools designed to make sustainability effortless and rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left: Tabs */}
            <div className="md:col-span-5 space-y-4">
              {features.map((f, idx) => (
                <div
                  key={f.id}
                  onClick={() => setActiveFeature(idx)}
                  className={`group p-5 rounded-xl cursor-pointer border transition-all duration-300 ${
                    activeFeature === idx
                      ? "bg-white dark:bg-gray-800 border-green-500 shadow-lg scale-[1.02]"
                      : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        activeFeature === idx
                          ? f.bg
                          : "bg-gray-100 dark:bg-gray-800"
                      } ${f.color}`}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-lg mb-1 group-hover:text-green-600 transition-colors ${
                          activeFeature === idx
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {f.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Visual Preview Area */}
            <div className="md:col-span-7">
              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-3xl p-8 h-[400px] flex items-center justify-center relative overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Render Active Visual */}
                <div className="relative z-10 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-64 aspect-4/5 flex items-center justify-center border border-gray-100 dark:border-gray-800 transform transition-all">
                  {features[activeFeature].visual}

                  {/* Fake Phone UI Elements */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded-b-xl"></div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Challenges Cards --- */}
      <section
        id="challenges"
        className="py-20 px-4 bg-gray-900 text-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Active Challenges
              </h2>
              <p className="text-gray-400 max-w-md">
                Join thousands of others in monthly sustainability sprints.
              </p>
            </div>
            <Link
              to="/register"
              className="hidden md:block text-green-400 hover:text-green-300 font-medium mt-4 md:mt-0"
            >
              View All Challenges &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "c1",
                title: "Meat-Free Month",
                desc: "Go vegetarian for 30 days",
                reward: "5 Trees",
                icon: <Leaf />,
                color: "bg-green-500",
              },
              {
                id: "c2",
                title: "Bike to Work",
                desc: "Cycle 50km this month",
                reward: "3 Trees",
                icon: <TrendingDown />,
                color: "bg-blue-500",
              },
              {
                id: "c3",
                title: "Zero Waste Week",
                desc: "No plastic for 7 days",
                reward: "2 Trees",
                icon: <Star />,
                color: "bg-orange-500",
              },
            ].map((c) => (
              <div
                key={c.id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Glow Effect on Hover */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${c.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`}
                ></div>

                <div
                  className={`w-12 h-12 ${c.color} rounded-lg flex items-center justify-center mb-6 text-white shadow-lg`}
                >
                  {c.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-gray-400 mb-6 text-sm">{c.desc}</p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-mono bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-700">
                    Reward: {c.reward}
                  </span>
                  <Button
                    size="sm"
                    variant={
                      joinedChallenges.includes(c.id) ? "outline" : "default"
                    }
                    className={
                      joinedChallenges.includes(c.id)
                        ? "border-green-500 text-green-500"
                        : "bg-white text-gray-900 hover:bg-gray-200"
                    }
                    onClick={() => handleJoinChallenge(c.id)}
                  >
                    {joinedChallenges.includes(c.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" /> Joined
                      </>
                    ) : (
                      "Join"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-6">
            <TreePine size={32} />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to plant your first tree?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Join a community of eco-warriors turning daily habits into global
            impact.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="px-10 py-6 text-lg rounded-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-2xl"
            >
              Create Free Account
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* --- Footer (Simplified) --- */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 text-sm">
        <p>&copy; 2025 EcoTracker. Building a greener future.</p>
      </footer>
    </div>
  );
};
