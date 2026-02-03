import { Memory, User, Tag, FamilyMemories } from "@/types/types";

// user data
export const sampleUser: User = {
  id: "user-sarah",
  name: "Sarah Johnson",
  email: "sarah@example.com",
  avatar:
    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
  preferences: {
    theme: "light",
  },
  role: "admin", // Default role for sample user
};

export const adminUser: User = {
  id: "user-admin",
  name: "Admin User",
  email: "admin@example.com",
  avatar:
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150",
  preferences: {
    theme: "dark",
  },
  role: "admin",
};

export const notification = [
  {
    id: "notif-1",
    type: "memory_shared" as const,
    title: "Mom shared a memory",
    message:
      "Family Thanksgiving Dinner - What an amazing Thanksgiving we had this year!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: "notif-2",
    type: "comment" as const,
    title: "Dad commented on your memory",
    message: "Great photo! I remember that day so well.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif-3",
    type: "family_invite" as const,
    title: "Family invitation sent",
    message: "Your invitation to Emma was sent successfully.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// fetch comments and reactions with id
export const familyMemories: FamilyMemories[] = [
  {
    id: "family-memory-1",
    memoryId: "family-memory-1",
    userId: "user-sarah",
    sharedBy: "user-john",
    memory: {
      id: "family-memory-1",
      content: "A truly special day celebrating Grandma's 90th!",
      title: "Grandma's 90th birthday",
      date: "2024-06-01",
      mood: "joyful",
      tags: ["family", "birthday", "celebration", "grandma"],
      images: [
        "https://images.pexels.com/photos/1721941/pexels-photo-1721941.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      location: "Family Home, San Diego",
      syncStatus: "synced",
      createdAt: "2024-06-01T15:00:00Z",
      updatedAt: "2024-06-01T15:00:00Z",
      userId: "user-john",
      isPublic: true,
    },
    user: {
      id: "user-john",
      name: "John Doe",
      email: "john@example.com",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "family-memory-2",
    memoryId: "family-memory-2",
    userId: "user-sarah",
    sharedBy: "user-emma",
    memory: {
      id: "family-memory-2",
      content: "A day filled with laughter and fun at the beach with family.",
      title: "Fun family beach day ",
      date: "2023-08-15",
      mood: "joyful",
      tags: ["family", "beach", "fun", "summer"],
      images: [
        "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      location: "Beachside, California",
      syncStatus: "synced",
      createdAt: "2023-08-15T10:00:00Z",
      updatedAt: "2023-08-15T10:00:00Z",
      userId: "user-emma",
      isPublic: true,
    },
    user: {
      id: "user-emma",
      name: "Emma Smith",
      email: "emma@example.com",
      avatar:
        "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "family-memory-3",
    memoryId: "family-memory-3",
    userId: "user-sarah",
    sharedBy: "user-john",
    memory: {
      id: "family-memory-3",
      content: "Another fantastic summer BBQ at the lake house.",
      title: "Annual family BBQ ",
      date: "2023-07-20",
      mood: "peaceful",
      tags: ["family", "summer", "bbq", "lake"],
      images: [
        "https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      location: "Lake Tahoe",
      syncStatus: "synced",
      createdAt: "2023-07-20T17:00:00Z",
      updatedAt: "2023-07-20T17:00:00Z",
      userId: "user-john",
      isPublic: true,
    },
    user: {
      id: "user-john",
      name: "John Doe",
      email: "john@example.com",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
];

// family member data
export const timeRangeOptions = [
  { value: "week", label: "Past 7 days" },
  { value: "month", label: "Past 30 days" },
  { value: "quarter", label: "Past 3 months" },
  { value: "year", label: "Past 12 months" },
  { value: "all", label: "All time" },
];

export const moodColors = {
  grateful: "bg-green-500",
  joyful: "bg-yellow-500",
  peaceful: "bg-blue-500",
  excited: "bg-orange-500",
  reflective: "bg-purple-500",
  nostalgic: "bg-pink-500",
};

export const analytics = {
  totalMemories: 247,
  memoriesThisMonth: 18,
  averagePerWeek: 4.2,
  longestStreak: 12,
  topMoods: [
    { mood: "grateful", count: 45, percentage: 18 },
    { mood: "joyful", count: 38, percentage: 15 },
    { mood: "peaceful", count: 32, percentage: 13 },
    { mood: "excited", count: 28, percentage: 11 },
    { mood: "reflective", count: 24, percentage: 10 },
  ],
  topTags: [
    { tag: "family", count: 67, percentage: 27 },
    { tag: "travel", count: 43, percentage: 17 },
    { tag: "work", count: 38, percentage: 15 },
    { tag: "friends", count: 35, percentage: 14 },
    { tag: "hobbies", count: 29, percentage: 12 },
  ],
  monthlyActivity: [
    { month: "Jan", memories: 15 },
    { month: "Feb", memories: 22 },
    { month: "Mar", memories: 18 },
    { month: "Apr", memories: 25 },
    { month: "May", memories: 31 },
    { month: "Jun", memories: 28 },
    { month: "Jul", memories: 35 },
    { month: "Aug", memories: 29 },
    { month: "Sep", memories: 24 },
    { month: "Oct", memories: 27 },
    { month: "Nov", memories: 18 },
    { month: "Dec", memories: 15 },
  ],
  weeklyPattern: [
    { day: "Mon", memories: 12 },
    { day: "Tue", memories: 8 },
    { day: "Wed", memories: 15 },
    { day: "Thu", memories: 18 },
    { day: "Fri", memories: 22 },
    { day: "Sat", memories: 35 },
    { day: "Sun", memories: 28 },
  ],
};

export const sampleTags: Tag[] = [
  { id: "tag-1", name: "family", color: "#3B82F6", count: 45 },
  { id: "tag-2", name: "travel", color: "#10B981", count: 32 },
  { id: "tag-3", name: "work", color: "#F59E0B", count: 28 },
  { id: "tag-4", name: "friends", color: "#8B5CF6", count: 24 },
  { id: "tag-5", name: "hobbies", color: "#EF4444", count: 18 },
  { id: "tag-6", name: "milestones", color: "#14B8A6", count: 15 },
];

export const sampleMemories: Memory[] = [
  {
    id: "memory-1",
    title: "Family Thanksgiving Dinner",
    content: `What an amazing Thanksgiving we had this year! The whole family gathered at Mom and Dad's house - all 15 of us squeezed around the extended dining room table. 
    
Uncle Mike told his famous stories again, and somehow they get funnier every year. Little Emma, now 6, insisted on saying grace and thanked God for "turkey, pie, and video games" which had everyone laughing.

Mom outdid herself with the cooking. The turkey was perfectly golden, and her stuffing recipe (still secret after all these years) was incredible as always. Dad carved the turkey with his usual ceremony, telling us about the "proper technique" he learned from his father.

After dinner, we played charades in the living room. Cousin Jake's impression of a penguin was so ridiculous that Grandma laughed until she cried. These are the moments I want to remember forever - the laughter, the warmth, the feeling of being surrounded by people who love you unconditionally.`,
    summary:
      "Wonderful family Thanksgiving gathering with 15 family members, featuring Mom's incredible cooking, Uncle Mike's stories, and hilarious charades games.",
    date: "2024-11-28",
    mood: "grateful",
    tags: ["family", "holidays", "traditions", "thanksgiving"],
    images: [
      "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Parents' House, Portland",
    syncStatus: "synced",
    createdAt: "2024-11-28T20:30:00Z",
    updatedAt: "2024-11-28T20:30:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: true, // Example of a public memory
  },
  {
    id: "memory-2",
    title: "Sunrise Hike at Mount Hood",
    content: `Woke up at 4 AM for what turned out to be one of the most beautiful experiences of my life. The drive to Mount Hood was peaceful in the pre-dawn darkness, with just my favorite playlist and a thermos of coffee for company.

Starting the trail in complete darkness with just my headlamp was a bit intimidating, but also thrilling. About halfway up, I met another early hiker - an elderly gentleman named Frank who's been doing sunrise hikes for 30 years. We hiked together the rest of the way, sharing stories about our favorite trails.

When we reached the viewpoint just as the sun crested the horizon, I was completely speechless. The entire landscape was bathed in this incredible golden light, with the mountain peaks stretching endlessly in every direction. Frank and I just stood there in comfortable silence, both of us knowing we were witnessing something special.

I took so many photos, but none of them captured the feeling of that moment - the crisp mountain air, the sense of accomplishment, and the pure joy of being alive in such a beautiful place.`,
    summary:
      "Pre-dawn hike to Mount Hood for sunrise, meeting fellow hiker Frank and experiencing breathtaking golden light over mountain peaks.",
    date: "2024-11-15",
    mood: "peaceful",
    tags: ["hiking", "nature", "sunrise", "mountains", "solo adventure"],
    images: [
      "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Mount Hood, Oregon",
    syncStatus: "synced",
    createdAt: "2024-11-15T18:45:00Z",
    updatedAt: "2024-11-15T18:45:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: false, // Example of a private memory
  },
  {
    id: "memory-3",
    title: "Surprise Birthday Party Success!",
    content: `Three weeks of secret planning finally paid off! Organizing a surprise party for Alex was more stressful than I expected, but seeing his face when he walked into the restaurant was absolutely worth every anxious moment.

We managed to get all his college friends together - some flying in from different states. The hardest part was keeping it secret from someone who notices everything. I had to create fake dinner plans and coordinate with his roommate to get him there at the right time.

The moment he opened the door and everyone yelled "Surprise!", his expression was priceless. He just stood there with his mouth open for about 10 seconds before breaking into the biggest smile. Then came the tears (happy ones, thank goodness).

The dinner was fantastic, filled with stories from college, embarrassing photo sharing, and way too much laughter. The custom photo book we made with memories from our friendship over the years was a huge hit. Alex kept flipping through it all evening, pointing out memories I'd forgotten about.

Best friend mission: accomplished!`,
    summary:
      "Successfully threw a surprise birthday party for Alex with college friends flying in, featuring emotional reactions and a custom photo book.",
    date: "2024-10-22",
    mood: "joyful",
    tags: ["friendship", "birthday", "surprise", "celebration", "planning"],
    images: [
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Bella Vista Restaurant",
    syncStatus: "synced",
    createdAt: "2024-10-22T22:15:00Z",
    updatedAt: "2024-10-22T22:15:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: true, // Example of a public memory
  },
  {
    id: "memory-4",
    title: "First Day at New Job",
    content: `Today marked the beginning of a new chapter in my career, and I\'m feeling a mix of excitement and nerves. The office is in this beautiful historic building downtown, with huge windows and exposed brick walls that give it such character.

My manager, Jennifer, gave me the grand tour and introduced me to what seems like a hundred people. Everyone was incredibly welcoming, though I know it\'ll take me weeks to remember all the names. The company culture feels so different from my last job - more collaborative, more innovative.

My workspace is perfect - right by a window with a view of the city park. I spent the morning setting up my computer and going through orientation materials. Lunch was with my new team at a local café, and they shared some inside jokes and stories that made me feel like I might actually fit in here.

The work itself looks challenging but exciting. I\'ll be leading the redesign of their mobile app, which is exactly the kind of project I\'ve been hoping for. It feels good to be somewhere that values creativity and user experience.

Here\'s to new beginnings!`,
    summary:
      "First day at new job in historic downtown building, welcoming team, exciting mobile app redesign project, and positive company culture.",
    date: "2024-09-03",
    mood: "excited",
    tags: ["work", "career", "new beginnings", "milestone"],
    location: "Downtown Office Building",
    syncStatus: "synced",
    createdAt: "2024-09-03T19:00:00Z",
    updatedAt: "2024-09-03T19:00:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: false, // Example of a private memory
  },
  {
    id: "memory-5",
    title: "Cooking Disaster Turned Victory",
    content: `Attempted to make homemade pasta from scratch for dinner tonight. What started as an ambitious culinary adventure quickly turned into what can only be described as a flour explosion in my kitchen.

The pasta dough was supposed to be smooth and elastic. Mine looked more like abstract art and had the texture of Play-Doh. After three failed attempts and flour literally everywhere - in my hair, on the walls, somehow even on the ceiling - I was ready to order pizza.

But then I remembered my grandmother's advice: "Cooking is about love, not perfection." So I embraced the chaos, put on some music, and just enjoyed the process. The fourth attempt actually worked! The pasta wasn't perfectly uniform, but it had character.

The final dish - pasta with homemade pesto and roasted vegetables - was actually delicious. More importantly, the whole experience reminded me that sometimes the best memories come from things not going according to plan. Plus, I now have a newfound respect for professional pasta makers.

Note to self: buy more flour.`,
    summary:
      "Chaotic but ultimately successful attempt at homemade pasta, turning kitchen disaster into delicious dinner and valuable life lesson.",
    date: "2024-08-17",
    mood: "reflective",
    tags: ["cooking", "learning", "perseverance", "home"],
    images: [
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Home Kitchen",
    syncStatus: "pending",
    createdAt: "2024-08-17T21:30:00Z",
    updatedAt: "2024-08-17T21:30:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: true, // Example of a public memory
  },
  {
    id: "memory-6",
    title: "Late Night Call with Mom",
    content: `Couldn\'t sleep tonight, so I called Mom. It was 2 AM my time, but I knew she\'d be up early getting ready for work. Sometimes you just need to hear your mother\'s voice.

We talked for over an hour about everything and nothing. She told me about the new flowers she planted in the garden, and I shared my worries about the presentation I have next week. She has this amazing ability to make everything seem manageable just by listening.

She also shared a story I\'d never heard before about when she was my age and starting her career. Apparently, she was just as anxious and uncertain as I often feel. It\'s funny how parents seem invincible when you\'re growing up, and then you realize they\'re human too.

Before hanging up, she said something that really stuck with me: "You\'re doing better than you think you are, sweetheart. Trust yourself." Sometimes that\'s exactly what you need to hear at 2 AM.

I slept really well after that call.`,
    summary:
      "Comforting late-night phone call with Mom, sharing worries and stories, receiving encouragement and wisdom about trusting yourself.",
    date: "2024-07-12",
    mood: "grateful",
    location: "college",
    tags: ["family", "support", "conversation", "wisdom", "late night"],
    syncStatus: "synced",
    createdAt: "2024-07-12T09:15:00Z",
    updatedAt: "2024-07-12T09:15:00Z",
    userId: "user-sarah", // Assign to current user
    isPublic: false, // Example of a private memory
  },
];

export const sampleFamilyMembers: User[] = [
  {
    id: "user-john",
    name: "John Doe",
    email: "john@example.com",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    preferences: {
      theme: "system",
    },
  },
  {
    id: "user-emma",
    name: "Emma Smith",
    email: "emma@example.com",
    avatar:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=150",
    preferences: {
      theme: "dark",
    },
  },
];
export const sampleFamilyMemories: Memory[] = [
  {
    id: "family-memory-1",
    title: "Grandma's 90th Birthday",
    content: `A truly special day celebrating Grandma's 90th! The entire family flew in from all over the world. It was a huge gathering, filled with laughter, old stories, and a few happy tears. She looked so radiant, blowing out all those candles on her cake.`,
    summary:
      "Grandma's 90th birthday celebration with family from around the world.",
    date: "2024-06-01",
    mood: "joyful",
    tags: ["family", "birthday", "celebration", "grandma"],
    images: [
      "https://images.pexels.com/photos/1721941/pexels-photo-1721941.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Family Home, San Diego",
    syncStatus: "synced",
    createdAt: "2024-06-01T15:00:00Z",
    updatedAt: "2024-06-01T15:00:00Z",
    userId: "user-john", // John Doe's memory
    isPublic: true,
  },
  {
    id: "family-memory-2",
    title: "Ski Trip to Aspen",
    content: `Amazing week on the slopes in Aspen with the family! The snow was perfect, and the views were incredible. Even little Leo managed to get down the bunny slope without too many tumbles.`,
    summary: "Fun family ski trip in Aspen with perfect snow and great views.",
    date: "2024-02-15",
    mood: "excited",
    tags: ["family", "travel", "skiing", "winter"],
    images: [
      "https://images.pexels.com/photos/33045/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Aspen, Colorado",
    syncStatus: "synced",
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
    userId: "user-emma", // Emma Smith's memory
    isPublic: true,
  },
  {
    id: "family-memory-3",
    title: "Summer BBQ at the Lake House",
    content: `Another fantastic summer BBQ at the lake house. The weather was perfect, the food was delicious, and it was great to see everyone relaxing by the water. Dad's burgers were, as always, legendary.`,
    summary: "Annual family BBQ at the lake house with great food and weather.",
    date: "2023-07-20",
    mood: "peaceful",
    tags: ["family", "summer", "bbq", "lake"],
    images: [
      "https://images.pexels.com/photos/1482803/pexels-photo-1482803.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
    location: "Lake Tahoe",
    syncStatus: "synced",
    createdAt: "2023-07-20T17:00:00Z",
    updatedAt: "2023-07-20T17:00:00Z",
    userId: "user-john", // John Doe's memory
    isPublic: true, // Example of a private family memory
  },
];

export const sampleStoryExample = `# A Year of Growth and Discovery

As I look back on this year, I'm struck by how much has changed and how much I've grown. It started with that nerve-wracking first day at my new job in September, walking into that beautiful historic building downtown with a mixture of excitement and anxiety coursing through my veins.

The transition wasn't always smooth. There were moments of doubt, like that late-night call with Mom in July when I needed to hear that I was doing better than I thought. Her words of wisdom - "Trust yourself" - became a mantra that carried me through the challenging months.

But challenges often lead to the most beautiful discoveries. That sunrise hike at Mount Hood in November reminded me of the importance of solitude and nature in my life. Meeting Frank, that elderly hiker who's been chasing sunrises for 30 years, showed me that some passions are worth pursuing for a lifetime.

The year was also filled with moments of pure joy and connection. Organizing Alex's surprise birthday party was a testament to the power of friendship and the joy that comes from giving to others. Seeing his face light up when everyone yelled "Surprise!" reminded me why relationships are the foundation of a meaningful life.

Even my failures became victories. That cooking disaster in August, where my kitchen looked like a flour bomb had exploded, taught me that perfection isn't the goal - growth is. The pasta I finally created wasn't restaurant-quality, but it was made with love and persistence.

And then there was Thanksgiving - that beautiful chaos of fifteen family members gathered around the extended dining room table. Uncle Mike's stories, little Emma's prayer for "turkey, pie, and video games," and Grandma laughing until she cried during charades. These moments remind me that home isn't a place; it's the people who love you unconditionally.

As this year draws to a close, I'm grateful for every experience - the triumphs, the challenges, the quiet moments of reflection, and the celebrations with loved ones. Each memory has contributed to the person I'm becoming, and I'm excited to see what stories next year will bring.`;

// Empty states content
export const emptyStates = {
  noMemories: {
    title: "No memories yet",
    message:
      "Start capturing your life's moments by creating your first memory.",
    action: "Create Memory",
  },
  noResults: {
    title: "No results found",
    message: "Try adjusting your search terms or filters.",
    action: "Clear Filters",
  },
  offline: {
    title: "You're offline",
    message: "Some features may be limited until you reconnect.",
    action: "Retry",
  },
  error: {
    title: "Something went wrong",
    message: "We're having trouble loading your memories. Please try again.",
    action: "Retry",
  },
};

// Confirmation dialogs
export const confirmationDialogs = {
  deleteMemory: {
    title: "Delete Memory",
    message:
      "Are you sure you want to delete this memory? This action cannot be undone.",
    confirm: "Delete",
    cancel: "Cancel",
  },
  deleteAccount: {
    title: "Delete Account",
    message:
      "This will permanently delete your account and all your memories. This action cannot be undone.",
    confirm: "Delete Account",
    cancel: "Keep Account",
  },
  clearAllData: {
    title: "Clear All Data",
    message:
      "This will remove all your memories and data from this device. Make sure you've backed up anything important.",
    confirm: "Clear Data",
    cancel: "Cancel",
  },
};
