import { BlogPost, PricingPlan, EnergyDataPoint } from '@/types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'maximize-solar-roi',
    title: 'How to Maximize Your Solar ROI in 2025',
    excerpt: 'Discover proven strategies to get the highest return on your solar investment, from optimal panel placement to smart energy storage solutions.',
    content: `Solar energy investments have never been more attractive, with average payback periods dropping to under 7 years in most regions. To maximize your return on investment, you need to consider several key factors.

## Panel Orientation and Tilt Angle

The positioning of your solar panels dramatically affects output. In the Northern Hemisphere, panels facing true south at an angle equal to your latitude generally produce the most energy over the course of a year. However, slight variations can improve morning or afternoon production depending on your usage patterns.

## Energy Storage Integration

Pairing your solar installation with battery storage allows you to use self-generated power during peak rate hours, significantly improving your financial returns. Modern lithium-ion batteries have dropped in price by 89% over the past decade, making storage economics increasingly attractive.

## Smart Energy Management

AI-powered energy management systems, like those offered through SolarPhase, can automatically shift flexible loads to times of peak solar production. Running dishwashers, EV chargers, and pool pumps during solar hours instead of grid hours can add another 10-15% to your effective savings.

## Government Incentives

Federal and state incentives continue to make solar more accessible. The Federal Investment Tax Credit (ITC) currently offers a 30% credit on solar installations, and many states stack additional incentives on top.

## Performance Monitoring

Regular monitoring through platforms like SolarPhase ensures your system is performing at its best. Studies show that monitored systems perform up to 20% better than unmonitored ones due to early fault detection.`,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    author: 'Sarah Chen',
    date: 'May 12, 2025',
    category: 'Finance',
    readTime: '6 min read',
  },
  {
    id: '2',
    slug: 'battery-storage-trends',
    title: 'Battery Storage Trends Reshaping Solar in 2025',
    excerpt: 'From solid-state batteries to virtual power plants, explore the storage innovations that are transforming how we capture and use solar energy.',
    content: `The battery storage market is undergoing a transformation that will define solar energy for the next decade. Here is what you need to know about the technologies that are changing the game.

## Solid-State Batteries Entering the Market

After years of laboratory development, solid-state batteries are beginning to reach commercial solar markets. These batteries offer higher energy density, longer cycle life, and improved safety compared to conventional lithium-ion chemistries. Early commercial deployments show promise for residential applications.

## Virtual Power Plants

Aggregating thousands of home battery systems into virtual power plants (VPPs) is creating new revenue streams for solar owners. Utilities are paying homeowners to use their batteries to support the grid during peak demand, adding another layer of financial return to solar investments.

## Flow Battery Resurgence

For commercial and industrial applications, vanadium flow batteries are gaining renewed interest due to their virtually unlimited cycle life and ability to independently scale energy and power capacity. SolarPhase has partnered with several flow battery manufacturers to offer these solutions through our commercial division.

## Thermal Storage Integration

Combining solar generation with thermal energy storage – using excess electricity to heat water or create ice – offers cost-effective storage for specific applications, particularly commercial buildings with significant HVAC loads.`,
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
    author: 'Marcus Williams',
    date: 'April 28, 2025',
    category: 'Technology',
    readTime: '5 min read',
  },
  {
    id: '3',
    slug: 'government-subsidies-2025',
    title: 'Complete Guide to Solar Subsidies and Incentives in 2025',
    excerpt: 'A comprehensive breakdown of federal, state, and utility incentives available for solar installations, and how to claim every dollar you are entitled to.',
    content: `Navigating the landscape of solar incentives can feel overwhelming, but capturing all available financial support is critical to optimizing your solar investment. This guide covers everything available in 2025.

## Federal Investment Tax Credit (ITC)

The Inflation Reduction Act extended the 30% Federal ITC through 2032 for residential and commercial solar installations. This credit directly reduces your federal tax liability. For a $20,000 system, that is $6,000 off your tax bill.

## State-Level Incentives

Forty-one states offer some form of solar incentive beyond the federal credit. California, New York, and Massachusetts lead with the most generous programs, but significant incentives exist across the country. SolarPhase's assessment tool automatically identifies all incentives applicable to your location.

## Net Metering Policies

Net metering allows you to sell excess solar generation back to the utility at retail rates. While some states have transitioned to less favorable net billing arrangements, many strong net metering markets remain. Understanding your local policy is essential to financial projections.

## USDA Rural Energy for America Program

For farms and rural businesses, REAP grants cover up to 40% of project costs, stackable with the ITC. This program is dramatically underutilized by eligible businesses.

## Utility Rebates

Many utilities offer their own rebate programs, ranging from $50 to over $1,000 per installed kilowatt. These programs frequently have limited funding and close when allocated, so timing matters.`,
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
    author: 'Jennifer Park',
    date: 'April 10, 2025',
    category: 'Policy',
    readTime: '7 min read',
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'residential',
    name: 'Residential',
    description: 'Perfect for homeowners starting their solar journey.',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'AI solar potential assessment',
      'Up to 1 installation monitored',
      'Basic energy analytics',
      'Monthly performance reports',
      'Carbon footprint tracker',
      'Email support (48h response)',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced tools for businesses and serious solar adopters.',
    monthlyPrice: 89,
    yearlyPrice: 890,
    features: [
      'Everything in Residential',
      'Up to 10 installations',
      'Real-time monitoring dashboard',
      'AI-powered optimization alerts',
      'Financing marketplace access',
      'ROI calculator and projections',
      'Priority support (4h response)',
      'API access',
    ],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Scalable solutions for large fleets and utility-scale projects.',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      'Everything in Professional',
      'Unlimited installations',
      'White-label reporting',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'On-site training',
      'Custom AI models',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export const ENERGY_DATA: EnergyDataPoint[] = [
  { date: 'Mon', generation: 32, consumption: 28, export: 4 },
  { date: 'Tue', generation: 41, consumption: 31, export: 10 },
  { date: 'Wed', generation: 28, consumption: 33, export: 0 },
  { date: 'Thu', generation: 55, consumption: 35, export: 20 },
  { date: 'Fri', generation: 48, consumption: 29, export: 19 },
  { date: 'Sat', generation: 62, consumption: 22, export: 40 },
  { date: 'Sun', generation: 58, consumption: 20, export: 38 },
];

export const FAQ_ITEMS = [
  {
    question: 'How does the AI solar assessment work?',
    answer: 'Our AI analyzes satellite imagery of your property, local weather patterns, shading from trees and structures, roof orientation, and your current electricity usage to calculate your solar potential. The assessment typically takes under 60 seconds and provides accurate generation estimates within 5% of actual production.',
  },
  {
    question: 'What equipment does SolarPhase require for monitoring?',
    answer: 'SolarPhase is compatible with all major inverter brands including SolarEdge, Enphase, Fronius, SMA, and Huawei. Our monitoring device connects to your inverter and local network, uploading real-time data to our cloud platform. Installation takes about 15 minutes.',
  },
  {
    question: 'How does the financing marketplace work?',
    answer: 'SolarPhase aggregates loan and lease offers from over 40 solar financing partners. After completing a soft credit check (no impact on your score), you receive pre-qualified offers from multiple lenders. You can compare rates, terms, and total costs before selecting the best option for your situation.',
  },
  {
    question: 'Can I monitor multiple properties from one account?',
    answer: 'Yes. The Professional plan supports up to 10 installations, and the Enterprise plan supports unlimited installations. All properties are visible from a single dashboard, with aggregated and individual views available.',
  },
  {
    question: 'What happens if my system underperforms?',
    answer: 'SolarPhase continuously compares your actual production to expected production based on local weather data. If performance drops below 90% of expected for more than 3 consecutive days, you receive an automatic alert. Our diagnostic tools help identify whether the issue is inverter-related, shading-related, or requires professional service.',
  },
  {
    question: 'Is my energy and billing data secure?',
    answer: 'Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We are SOC 2 Type II certified and comply with relevant data protection regulations. Your data is never sold to third parties. You can export or delete your data at any time.',
  },
  {
    question: 'Does SolarPhase work with battery storage systems?',
    answer: 'Yes. SolarPhase supports monitoring and optimization for Tesla Powerwall, LG RESU, Enphase IQ Battery, sonnen, and other major residential battery systems. Our AI automatically optimizes charge and discharge schedules based on electricity rates, weather forecasts, and your usage patterns.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel your subscription at any time. For monthly plans, cancellation takes effect at the end of the current billing period. For annual plans, we offer a prorated refund within the first 30 days. Your historical data is retained for 12 months after cancellation.',
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Michael Torres',
    role: 'Homeowner',
    location: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
    text: 'SolarPhase helped me go from "thinking about solar" to a fully optimized system. The AI assessment was more accurate than the quote I got from an installer, and the monitoring catches issues I would never have noticed myself.',
  },
  {
    id: 2,
    name: 'Amanda Reeves',
    role: 'Operations Manager',
    location: 'Atlanta, GA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    text: 'We manage solar installations across 23 commercial properties. SolarPhase gives us a single dashboard for everything. The ROI reporting has helped us secure three new contracts.',
  },
  {
    id: 3,
    name: 'David Kim',
    role: 'Solar Installer',
    location: 'San Jose, CA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 5,
    text: 'As an installer, I recommend SolarPhase to all my clients. The post-installation monitoring has cut my support calls by 60% because customers can see their system is working before they think to call.',
  },
];
