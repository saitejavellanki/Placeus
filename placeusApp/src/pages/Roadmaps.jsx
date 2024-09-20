import React, { useState } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Container,
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Icon,
  useColorModeValue,
  Progress,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaCode, FaLaptopCode, FaServer, FaCloud, FaMobileAlt, FaDatabase, FaBrain, FaGamepad, FaShieldAlt, FaCubes } from 'react-icons/fa';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
});

const roadmapData = {
 
  
  fullstack: [
    "Master HTML5, CSS3, and JavaScript (ES6+)",
    "Learn responsive web design and CSS frameworks (e.g., Bootstrap, Tailwind)",
    "Understand version control with Git and GitHub",
    "Master a frontend framework (React, Vue, or Angular)",
    "Learn state management (Redux, Vuex, or NgRx)",
    "Understand RESTful APIs and GraphQL",
    "Learn a backend language (Node.js, Python, Ruby, or Java)",
    "Master a backend framework (Express, Django, Rails, or Spring)",
    "Understand databases (SQL and NoSQL)",
    "Learn about ORMs and database design",
    "Implement authentication and authorization",
    "Understand web security best practices",
    "Learn about microservices architecture",
    "Master containerization and orchestration (Docker, Kubernetes)",
    "Understand cloud platforms (AWS, Azure, or Google Cloud)",
    "Learn CI/CD practices and tools",
    "Understand serverless architecture",
    "Master testing (unit, integration, and end-to-end)",
    "Learn about performance optimization and caching",
    "Understand web accessibility standards",
    "Master progressive web apps (PWAs)",
    "Learn about content management systems (CMS)",
    "Understand SEO best practices",
    "Master web analytics and performance monitoring",
    "Learn about internationalization and localization",
  ],
  frontend: [
    "Master HTML5 and CSS3",
    "Learn JavaScript deeply (ES6+ features)",
    "Understand Document Object Model (DOM)",
    "Learn about browser developer tools",
    "Master responsive web design",
    "Learn CSS preprocessors (Sass or Less)",
    "Understand CSS frameworks (Bootstrap, Tailwind, or Foundation)",
    "Master a frontend framework (React, Vue, or Angular)",
    "Learn state management (Redux, Vuex, or NgRx)",
    "Understand RESTful APIs and how to consume them",
    "Learn about GraphQL and Apollo client",
    "Master asynchronous programming (Promises, async/await)",
    "Understand web accessibility standards (WCAG)",
    "Learn about Progressive Web Apps (PWAs)",
    "Master frontend build tools (Webpack, Rollup, or Parcel)",
    "Understand module bundlers and transpilers (Babel)",
    "Learn about Single Page Applications (SPAs)",
    "Master frontend testing (Jest, React Testing Library, Cypress)",
    "Understand web performance optimization techniques",
    "Learn about static site generators (Next.js, Gatsby)",
    "Understand cross-browser compatibility issues",
    "Learn about CSS-in-JS solutions (Styled Components, Emotion)",
    "Master frontend security best practices",
    "Understand WebAssembly and its applications",
    "Learn about micro-frontends architecture",
  ],
  backend: [
    "Choose a backend language (Node.js, Python, Ruby, Java, or C#)",
    "Master a backend framework (Express, Django, Rails, Spring, or ASP.NET)",
    "Understand databases (SQL and NoSQL)",
    "Learn about database design and normalization",
    "Master CRUD operations and database queries",
    "Understand ORM (Object-Relational Mapping)",
    "Learn about RESTful API design principles",
    "Master API development and documentation",
    "Understand authentication and authorization mechanisms",
    "Learn about JSON Web Tokens (JWT)",
    "Master security best practices (OWASP Top 10)",
    "Understand caching mechanisms (Redis, Memcached)",
    "Learn about message queues (RabbitMQ, Apache Kafka)",
    "Understand containerization (Docker)",
    "Learn about container orchestration (Kubernetes)",
    "Master microservices architecture",
    "Understand serverless architecture",
    "Learn about cloud platforms (AWS, Azure, or Google Cloud)",
    "Master CI/CD pipelines",
    "Understand logging and monitoring in backend systems",
    "Learn about backend testing (unit, integration, and load testing)",
    "Understand scalability and high availability concepts",
    "Master database indexing and query optimization",
    "Learn about GraphQL API development",
    "Understand event-driven architecture",
  ],
  devops: [
    "Understand Linux fundamentals and shell scripting",
    "Master version control with Git",
    "Learn about CI/CD principles and tools (Jenkins, GitLab CI, or GitHub Actions)",
    "Understand containerization with Docker",
    "Master container orchestration with Kubernetes",
    "Learn about Infrastructure as Code (IaC)",
    "Master configuration management tools (Ansible, Puppet, or Chef)",
    "Understand cloud platforms (AWS, Azure, or Google Cloud)",
    "Learn about serverless architecture",
    "Master monitoring and logging tools (ELK stack, Prometheus, Grafana)",
    "Understand network protocols and security",
    "Learn about load balancing and reverse proxies (NGINX)",
    "Master database administration and optimization",
    "Understand distributed systems and microservices architecture",
    "Learn about service mesh (Istio)",
    "Master security best practices and tools",
    "Understand performance tuning and optimization",
    "Learn about disaster recovery and backup strategies",
    "Master automation and scripting (Python, Bash)",
    "Understand compliance and governance in IT",
    "Learn about GitOps principles and tools",
    "Master chaos engineering practices",
    "Understand site reliability engineering (SRE) principles",
    "Learn about cost optimization in cloud environments",
    "Master DevSecOps practices and tools",
  ],
  mobile: [
    "Understand mobile app architecture and design patterns",
    "Learn about mobile UI/UX design principles",
    "Master a mobile development platform (iOS or Android)",
    "Learn Swift and iOS SDK for iOS development",
    "Master Kotlin and Android SDK for Android development",
    "Understand cross-platform development frameworks (React Native or Flutter)",
    "Learn about mobile app state management",
    "Master mobile app testing and debugging techniques",
    "Understand mobile app security best practices",
    "Learn about offline data storage and synchronization",
    "Master push notifications and background processing",
    "Understand mobile app performance optimization",
    "Learn about mobile analytics and crash reporting",
    "Master mobile CI/CD pipelines",
    "Understand app store guidelines and submission process",
    "Learn about mobile backend as a service (MBaaS)",
    "Master responsive design for various screen sizes",
    "Understand location services and mapping in mobile apps",
    "Learn about augmented reality (AR) development for mobile",
    "Master mobile-specific hardware integration (camera, sensors)",
    "Understand mobile app monetization strategies",
    "Learn about progressive web apps (PWAs) for mobile",
    "Master mobile app internationalization and localization",
    "Understand mobile app accessibility guidelines",
    "Learn about emerging mobile technologies (5G, foldable devices)",
  ],
  dataScience: [
    "Master a programming language for data science (Python or R)",
    "Understand statistics and probability theory",
    "Learn about data structures and algorithms",
    "Master data cleaning and preprocessing techniques",
    "Understand exploratory data analysis (EDA)",
    "Learn about data visualization (Matplotlib, Seaborn, ggplot2)",
    "Master machine learning algorithms and techniques",
    "Understand deep learning and neural networks",
    "Learn about natural language processing (NLP)",
    "Master big data technologies (Hadoop, Spark)",
    "Understand data warehousing concepts",
    "Learn about SQL and NoSQL databases",
    "Master data mining techniques",
    "Understand feature engineering and selection",
    "Learn about time series analysis",
    "Master A/B testing and experimentation",
    "Understand ethical considerations in data science",
    "Learn about data science project management",
    "Master data storytelling and presentation",
    "Understand cloud platforms for data science (AWS, Azure, GCP)",
    "Learn about version control for data science projects",
    "Master reproducible research practices",
    "Understand AutoML and MLOps",
    "Learn about data governance and compliance",
    "Master ensemble methods and advanced ML techniques",
  ],
  cybersecurity: [
    "Understand fundamental security concepts and principles",
    "Learn about network protocols and architecture",
    "Master operating system security (Windows, Linux)",
    "Understand cryptography and encryption techniques",
    "Learn about web application security",
    "Master network security and firewalls",
    "Understand malware analysis and reverse engineering",
    "Learn about incident response and forensics",
    "Master security information and event management (SIEM)",
    "Understand cloud security principles and practices",
    "Learn about ethical hacking and penetration testing",
    "Master security compliance and regulations (GDPR, HIPAA)",
    "Understand wireless network security",
    "Learn about social engineering and phishing attacks",
    "Master identity and access management (IAM)",
    "Understand secure software development practices",
    "Learn about threat intelligence and threat hunting",
    "Master security automation and orchestration",
    "Understand IoT security challenges and solutions",
    "Learn about blockchain security",
    "Master mobile device security",
    "Understand zero trust security model",
    "Learn about AI and machine learning in cybersecurity",
    "Master DevSecOps practices",
    "Understand quantum computing implications for security",
  ],

  // Programming Languages
  javascript: [
    "Learn JavaScript syntax and basic concepts",
    "Understand variables, data types, and operators",
    "Master control structures (if/else, loops, switch)",
    "Learn about functions and scope",
    "Understand objects and arrays",
    "Master DOM manipulation and event handling",
    "Learn about asynchronous programming (Callbacks, Promises, async/await)",
    "Understand closures and prototypal inheritance",
    "Master ES6+ features (arrow functions, destructuring, modules)",
    "Learn about functional programming concepts in JavaScript",
    "Understand error handling and debugging",
    "Master JSON and working with APIs",
    "Learn about local storage and cookies",
    "Understand module systems (CommonJS, ES modules)",
    "Master testing in JavaScript (Jest, Mocha)",
    "Learn about package managers (npm, Yarn)",
    "Understand transpilers and build tools (Babel, Webpack)",
    "Master regular expressions in JavaScript",
    "Learn about design patterns in JavaScript",
    "Understand memory management and performance optimization",
    "Learn about WebSockets and real-time communication",
    "Master JavaScript frameworks (React, Vue, Angular)",
    "Understand server-side JavaScript (Node.js)",
    "Learn about TypeScript and static typing",
    "Master JavaScript security best practices",
  ],
  python: [
    "Learn Python syntax and basic concepts",
    "Understand variables, data types, and operators",
    "Master control structures (if/else, loops, match-case)",
    "Learn about functions and modules",
    "Understand lists, tuples, sets, and dictionaries",
    "Master object-oriented programming in Python",
    "Learn about file I/O and exception handling",
    "Understand decorators and generators",
    "Master Python's standard library",
    "Learn about virtual environments and package management (pip)",
    "Understand multithreading and multiprocessing",
    "Master working with databases in Python (SQLAlchemy)",
    "Learn about web scraping (BeautifulSoup, Scrapy)",
    "Understand web frameworks (Django, Flask)",
    "Master data analysis libraries (NumPy, Pandas)",
    "Learn about machine learning with Python (Scikit-learn, TensorFlow)",
    "Understand Python for DevOps (Ansible, Fabric)",
    "Master Python testing frameworks (unittest, pytest)",
    "Learn about Python design patterns",
    "Understand performance optimization in Python",
    "Learn about asynchronous programming in Python (asyncio)",
    "Master Python for data visualization (Matplotlib, Seaborn)",
    "Understand Python for scientific computing (SciPy)",
    "Learn about Python for web automation (Selenium)",
    "Master Python for natural language processing (NLTK, spaCy)",
  ],
  java: [
    "Learn Java syntax and basic concepts",
    "Understand variables, data types, and operators",
    "Master control structures (if/else, loops, switch)",
    "Learn about methods and method overloading",
    "Understand object-oriented programming in Java",
    "Master inheritance, polymorphism, and abstraction",
    "Learn about interfaces and abstract classes",
    "Understand Java Collections Framework",
    "Master exception handling and file I/O",
    "Learn about generics and annotations",
    "Understand multithreading and concurrency",
    "Master Java 8+ features (lambdas, streams, Optional)",
    "Learn about Java Memory Model and garbage collection",
    "Understand JDBC for database connectivity",
    "Master build tools (Maven, Gradle)",
    "Learn about Java frameworks (Spring, Hibernate)",
    "Understand testing in Java (JUnit, Mockito)",
    "Master Java design patterns",
    "Learn about Java performance tuning",
    "Understand Java security best practices",
    "Learn about Java Enterprise Edition (Jakarta EE)",
    "Master Java for Android development",
    "Understand Java Native Interface (JNI)",
    "Learn about Java 9+ modules system",
    "Master Java for big data processing (Hadoop, Spark)",
  ],
  "c++": [
    "Learn C++ syntax and basic concepts",
    "Understand variables, data types, and operators",
    "Master control structures (if/else, loops, switch)",
    "Learn about functions and function overloading",
    "Understand object-oriented programming in C++",
    "Master inheritance and polymorphism",
    "Learn about templates and generic programming",
    "Understand C++ Standard Template Library (STL)",
    "Master memory management and pointers",
    "Learn about exception handling and RAII",
    "Understand move semantics and perfect forwarding",
    "Master lambda expressions and closures",
    "Learn about multithreading and concurrency in C++",
    "Understand smart pointers and resource management",
    "Master C++11/14/17/20 features",
    "Learn about template metaprogramming",
    "Understand compilation process and linking",
    "Master C++ design patterns",
    "Learn about performance optimization in C++",
    "Understand embedded systems programming with C++",
    "Learn about C++ for game development",
    "Master C++ for systems programming",
    "Understand C++ for scientific computing",
    "Learn about C++ in competitive programming",
    "Master modern C++ best practices",
  ],
  go: [
    "Learn Go syntax and basic concepts",
    "Understand variables, data types, and operators",
    "Master control structures (if/else, loops, switch)",
    "Learn about functions and methods",
    "Understand structs and interfaces",
    "Master Go's built-in data structures (slices, maps)",
    "Learn about error handling in Go",
    "Understand packages and modules",
    "Master Go's concurrency model (goroutines and channels)",
    "Learn about defer, panic, and recover",
    "Understand pointers in Go",
    "Master Go's standard library",
    "Learn about testing in Go",
    "Understand Go tools (go fmt, go vet, go mod)",
    "Master JSON handling in Go",
    "Learn about web development with Go",
    "Understand database operations in Go",
    "Master Go design patterns",
    "Learn about performance optimization in Go",
    "Understand cross-compilation in Go",
    "Learn about Go for systems programming",
    "Master Go for cloud-native development",
    "Understand Go for microservices",
    "Learn about Go for DevOps and automation",
    "Master advanced concurrency patterns in Go",
  ]

  // ... (existing programming languages)
};

const categoryIcons = {
  fullstack: FaCode,
  frontend: FaLaptopCode,
  backend: FaServer,
  devops: FaCloud,
  mobile: FaMobileAlt,
  datascience: FaDatabase,
  machinelearning: FaBrain,
  gamedev: FaGamepad,
  cybersecurity: FaShieldAlt,
  blockchain: FaCubes,
};

const RoadmapPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("fullstack");
  const [showAllSteps, setShowAllSteps] = useState(false);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowAllSteps(false);
  };

  const visibleSteps = showAllSteps ? roadmapData[selectedCategory] : roadmapData[selectedCategory].slice(0, 5);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={12}>
          <VStack spacing={12} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="2xl" fontWeight="bold" mb={4} bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
                Master Your Tech Journey
              </Heading>
              <Text fontSize="xl" fontWeight="medium">
                Explore curated roadmaps to guide your learning path
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {Object.keys(roadmapData).map((category) => (
                <Box
                  key={category}
                  bg={cardBgColor}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  borderWidth={2}
                  borderColor={selectedCategory === category ? 'brand.400' : borderColor}
                  cursor="pointer"
                  onClick={() => handleCategoryChange(category)}
                  transition="all 0.3s"
                  _hover={{ transform: 'translateY(-5px)', boxShadow: '2xl' }}
                >
                  <VStack align="start" spacing={4}>
                    <Icon as={categoryIcons[category] || FaCode} boxSize={10} color="brand.500" />
                    <Heading as="h3" size="lg" fontWeight="semibold" textTransform="capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      {roadmapData[category].length} steps
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>

            {roadmapData[selectedCategory] && (
              <Box bg={cardBgColor} p={8} borderRadius="xl" boxShadow="xl" borderWidth={2} borderColor={borderColor}>
                <Heading as="h2" size="xl" mb={6} fontWeight="bold" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
                  {selectedCategory.replace(/([A-Z])/g, ' $1').trim()} Roadmap
                </Heading>
                <VStack align="stretch" spacing={6}>
                  {visibleSteps.map((step, index) => (
                    <Box key={index}>
                      <HStack spacing={4} mb={2}>
                        <Box
                          bg="brand.500"
                          color="white"
                          borderRadius="full"
                          w={8}
                          h={8}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                        >
                          {index + 1}
                        </Box>
                        <Text fontSize="lg" fontWeight="medium">{step}</Text>
                      </HStack>
                      <Progress value={(index + 1) * (100 / visibleSteps.length)} colorScheme="brand" borderRadius="full" />
                    </Box>
                  ))}
                </VStack>
                {!showAllSteps && roadmapData[selectedCategory].length > 5 && (
                  <Button
                    mt={8}
                    colorScheme="brand"
                    rightIcon={<ChevronRightIcon />}
                    onClick={() => setShowAllSteps(true)}
                    size="lg"
                    fontWeight="bold"
                    borderRadius="full"
                  >
                    Show all {roadmapData[selectedCategory].length} steps
                  </Button>
                )}
              </Box>
            )}

            <Flex justifyContent="center">
              <Box
                maxW="2xl"
                bg="brand.50"
                color="brand.900"
                p={6}
                borderRadius="xl"
                boxShadow="md"
              >
                <Heading as="h3" size="lg" mb={4} fontWeight="semibold">
                  Pro Tip
                </Heading>
                <Text fontSize="md">
                  Start with the fundamentals and progress through each step. Consistency is key - aim to learn and practice regularly. Build projects along the way to reinforce your skills and create a portfolio that showcases your growth.
                </Text>
              </Box>
            </Flex>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default RoadmapPage;