export const genres2 = [
	"Action",
	"Adventure",
	"Animation",
	"Biography",
	"Comedy",
	"Crime",
	"Drama",
	"Family",
	"Fantasy",
	"History",
	"Music",
	"Musical",
	"Mystery",
	"Romance",
	"Sci-Fi",
	"Thriller",
	"War",
	"Western"
]

const idmap = {}

export function get(id){
    return idmap[id];
}

export const genres = [
	{title:"Action",color: '#1c5568' },
	{title:"Adventure",color: '#093229' },
	{title:"Animation",color: '#f2dea7' },
	{title:"Biography",color: '#af3c51' },
	{title:"Comedy",color: '#de836b' },
	{title:"Crime",color: '#71638c' },
	{title:"Drama",color: '#680b12' },
	{title:"Family",color: '#e5c865' },
	{title:"Fantasy",color: '#d1e15f' },
	{title:"History",color: '#cc4534' },
    {title:"Horror",color: '#cc4534' },
	{title:"Music",color: '#2b8656' },
	{title:"Musical",color: '#296e5f' },
	{title:"Mystery",color: '#2e2440' },
	{title:"Romance",color: '#b01534' },
	{title:"Sci-Fi",color: '#97cb5c' },
	{title:"Thriller",color: '#1b396c' },
    {title:"Film-Noir",color: '#1b396c' },
    {title:"Sport",color: '#1b396c' },
	{title:"War",color: '#42192a' },
	{title:"Western",color: '#436467' }
]

for(let item of genres) {
    item.id = item.title.toLowerCase();
    item.movies = [];
    genres[item.id] = item;
}

genres.fetch = async function(id){
    await new Promise(v=> setTimeout(v,500));
    return genres[id];
}

export const movies = [
	{
		"title": "The Shawshank Redemption",
		"description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Tim Robbins",
				"character": "Andy Dufresne"
			},
			{
				"actor": "Morgan Freeman",
				"character": "Ellis Boyd 'Red' Redding"
			},
			{
				"actor": "Bob Gunton",
				"character": "Warden Norton"
			},
			{
				"actor": "William Sadler",
				"character": "Heywood"
			},
			{
				"actor": "Clancy Brown",
				"character": "Captain Hadley"
			}
		],
		"rating": 9.3
	},
	{
		"title": "The Godfather",
		"description": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Marlon Brando",
				"character": "Don Vito Corleone"
			},
			{
				"actor": "Al Pacino",
				"character": "Michael Corleone"
			},
			{
				"actor": "James Caan",
				"character": "Sonny Corleone"
			},
			{
				"actor": "Richard S. Castellano",
				"character": "Clemenza"
			},
			{
				"actor": "Robert Duvall",
				"character": "Tom Hagen"
			}
		],
		"rating": 9.2
	},
	{
		"title": "The Godfather: Part II",
		"description": "The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on the family crime syndicate.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Al Pacino",
				"character": "Michael"
			},
			{
				"actor": "Robert Duvall",
				"character": "Tom Hagen"
			},
			{
				"actor": "Diane Keaton",
				"character": "Kay"
			},
			{
				"actor": "Robert De Niro",
				"character": "Vito Corleone"
			},
			{
				"actor": "John Cazale",
				"character": "Fredo Corleone"
			}
		],
		"rating": 9
	},
	{
		"title": "The Dark Knight",
		"description": "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham, the Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
		"genres": [
			"Action",
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Christian Bale",
				"character": "Bruce Wayne"
			},
			{
				"actor": "Heath Ledger",
				"character": "Joker"
			},
			{
				"actor": "Aaron Eckhart",
				"character": "Harvey Dent"
			},
			{
				"actor": "Michael Caine",
				"character": "Alfred"
			},
			{
				"actor": "Maggie Gyllenhaal",
				"character": "Rachel"
			}
		],
		"rating": 9
	},
	{
		"title": "12 Angry Men",
		"description": "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Martin Balsam",
				"character": "Juror 1"
			},
			{
				"actor": "John Fiedler",
				"character": "Juror 2"
			},
			{
				"actor": "Lee J. Cobb",
				"character": "Juror 3"
			},
			{
				"actor": "E.G. Marshall",
				"character": "Juror 4"
			},
			{
				"actor": "Jack Klugman",
				"character": "Juror 5"
			}
		],
		"rating": 8.9
	},
	{
		"title": "Schindler's List",
		"description": "In German-occupied Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazi Germans.",
		"genres": [
			"Biography",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Liam Neeson",
				"character": "Oskar Schindler"
			},
			{
				"actor": "Ben Kingsley",
				"character": "Itzhak Stern"
			},
			{
				"actor": "Ralph Fiennes",
				"character": "Amon Goeth"
			},
			{
				"actor": "Caroline Goodall",
				"character": "Emilie Schindler"
			},
			{
				"actor": "Jonathan Sagall",
				"character": "Poldek Pfefferberg"
			}
		],
		"rating": 8.9
	},
	{
		"title": "Pulp Fiction",
		"description": "The lives of two mob hit men, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Tim Roth",
				"character": "Pumpkin"
			},
			{
				"actor": "Amanda Plummer",
				"character": "Honey Bunny"
			},
			{
				"actor": "Laura Lovelace",
				"character": "Waitress"
			},
			{
				"actor": "John Travolta",
				"character": "Vincent Vega"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Jules Winnfield"
			}
		],
		"rating": 8.9
	},
	{
		"title": "The Lord of the Rings: The Return of the King",
		"description": "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
		"genres": [
			"Adventure",
			"Drama",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Noel Appleby",
				"character": "Everard Proudfoot"
			},
			{
				"actor": "Ali Astin",
				"character": "Elanor Gamgee"
			},
			{
				"actor": "Sean Astin",
				"character": "Sam"
			},
			{
				"actor": "David Aston",
				"character": "Gondorian Soldier 3"
			},
			{
				"actor": "John Bach",
				"character": "Madril"
			}
		],
		"rating": 8.9
	},
	{
		"title": "Il buono, il brutto, il cattivo",
		"description": "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
		"genres": [
			"Western"
		],
		"cast": [
			{
				"actor": "Eli Wallach",
				"character": "Tuco"
			},
			{
				"actor": "Clint Eastwood",
				"character": "Blondie"
			},
			{
				"actor": "Lee Van Cleef",
				"character": "Sentenza / Angel Eyes"
			},
			{
				"actor": "Aldo Giuffrè",
				"character": "Alcoholic Union Captain"
			},
			{
				"actor": "Luigi Pistilli",
				"character": "Father Pablo Ramirez"
			}
		],
		"rating": 8.9
	},
	{
		"title": "Fight Club",
		"description": "An insomniac office worker, looking for a way to change his life, crosses paths with a devil-may-care soap maker, forming an underground fight club that evolves into something much, much more.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Edward Norton",
				"character": "The Narrator"
			},
			{
				"actor": "Brad Pitt",
				"character": "Tyler Durden"
			},
			{
				"actor": "Meat Loaf",
				"character": "Robert 'Bob' Paulsen"
			},
			{
				"actor": "Zach Grenier",
				"character": "Richard Chesler"
			},
			{
				"actor": "Richmond Arquette",
				"character": "Intern"
			}
		],
		"rating": 8.8
	},
	{
		"title": "The Lord of the Rings: The Fellowship of the Ring",
		"description": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle Earth from the Dark Lord Sauron.",
		"genres": [
			"Adventure",
			"Drama",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Alan Howard",
				"character": "Voice of the Ring"
			},
			{
				"actor": "Noel Appleby",
				"character": "Everard Proudfoot"
			},
			{
				"actor": "Sean Astin",
				"character": "Sam"
			},
			{
				"actor": "Sala Baker",
				"character": "Sauron"
			},
			{
				"actor": "Sean Bean",
				"character": "Boromir"
			}
		],
		"rating": 8.8
	},
	{
		"title": "Forrest Gump",
		"description": "While not intelligent, Forrest Gump has accidentally been present at many historic moments, but his true love, Jenny Curran, eludes him.",
		"genres": [
			"Comedy",
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Tom Hanks",
				"character": "Forrest Gump"
			},
			{
				"actor": "Rebecca Williams",
				"character": "Nurse at Park Bench"
			},
			{
				"actor": "Sally Field",
				"character": "Mrs. Gump"
			},
			{
				"actor": "Michael Conner Humphreys",
				"character": "Young Forrest"
			},
			{
				"actor": "Harold G. Herthum",
				"character": "Doctor"
			}
		],
		"rating": 8.8
	},
	{
		"title": "Star Wars: Episode V - The Empire Strikes Back",
		"description": "After the rebels are overpowered by the Empire on their newly established base, Luke Skywalker begins Jedi training with Master Yoda. His friends accept shelter from a questionable ally as Darth Vader hunts them in a plan to capture Luke.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Mark Hamill",
				"character": "Luke Skywalker"
			},
			{
				"actor": "Harrison Ford",
				"character": "Han Solo"
			},
			{
				"actor": "Carrie Fisher",
				"character": "Princess Leia"
			},
			{
				"actor": "Billy Dee Williams",
				"character": "Lando Calrissian"
			},
			{
				"actor": "Anthony Daniels",
				"character": "C-3PO"
			}
		],
		"rating": 8.8
	},
	{
		"title": "Inception",
		"description": "A thief, who steals corporate secrets through use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a CEO.",
		"genres": [
			"Action",
			"Adventure",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Leonardo DiCaprio",
				"character": "Cobb"
			},
			{
				"actor": "Joseph Gordon-Levitt",
				"character": "Arthur"
			},
			{
				"actor": "Ellen Page",
				"character": "Ariadne"
			},
			{
				"actor": "Tom Hardy",
				"character": "Eames"
			},
			{
				"actor": "Ken Watanabe",
				"character": "Saito"
			}
		],
		"rating": 8.8
	},
	{
		"title": "The Lord of the Rings: The Two Towers",
		"description": "While Frodo and Sam edge closer to Mordor with the help of the shifty Gollum, the divided fellowship makes a stand against Sauron's new ally, Saruman, and his hordes of Isengard.",
		"genres": [
			"Adventure",
			"Drama",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Bruce Allpress",
				"character": "Aldor"
			},
			{
				"actor": "Sean Astin",
				"character": "Sam"
			},
			{
				"actor": "John Bach",
				"character": "Madril"
			},
			{
				"actor": "Sala Baker",
				"character": "Man Flesh Uruk"
			},
			{
				"actor": "Cate Blanchett",
				"character": "Galadriel"
			}
		],
		"rating": 8.7
	},
	{
		"title": "One Flew Over the Cuckoo's Nest",
		"description": "A criminal pleads insanity after getting into trouble again and once in the mental institution rebels against the oppressive nurse and rallies up the scared patients.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Michael Berryman",
				"character": "Ellis"
			},
			{
				"actor": "Peter Brocco",
				"character": "Col. Matterson"
			},
			{
				"actor": "Dean R. Brooks",
				"character": "Dr. Spivey"
			},
			{
				"actor": "Alonzo Brown",
				"character": "Miller"
			},
			{
				"actor": "Scatman Crothers",
				"character": "Turkle"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Goodfellas",
		"description": "The story of Henry Hill and his life through the teen years into the years of mafia, covering his relationship with wife Karen Hill and his Mob partners Jimmy Conway and Tommy DeVitto in the Italian-American crime syndicate.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Robert De Niro",
				"character": "James Conway"
			},
			{
				"actor": "Ray Liotta",
				"character": "Henry Hill"
			},
			{
				"actor": "Joe Pesci",
				"character": "Tommy DeVito"
			},
			{
				"actor": "Lorraine Bracco",
				"character": "Karen Hill"
			},
			{
				"actor": "Paul Sorvino",
				"character": "Paul Cicero"
			}
		],
		"rating": 8.7
	},
	{
		"title": "The Matrix",
		"description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
		"genres": [
			"Action",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Keanu Reeves",
				"character": "Neo"
			},
			{
				"actor": "Laurence Fishburne",
				"character": "Morpheus"
			},
			{
				"actor": "Carrie-Anne Moss",
				"character": "Trinity"
			},
			{
				"actor": "Hugo Weaving",
				"character": "Agent Smith"
			},
			{
				"actor": "Gloria Foster",
				"character": "Oracle"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Shichinin no samurai",
		"description": "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
		"genres": [
			"Adventure",
			"Drama"
		],
		"cast": [
			{
				"actor": "Toshirô Mifune",
				"character": "Kikuchiyo"
			},
			{
				"actor": "Takashi Shimura",
				"character": "Kambei Shimada"
			},
			{
				"actor": "Keiko Tsushima",
				"character": "Shino"
			},
			{
				"actor": "Yukiko Shimazaki",
				"character": "Wife"
			},
			{
				"actor": "Kamatari Fujiwara",
				"character": "Farmer Manzo"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Star Wars",
		"description": "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a wookiee and two droids to save the galaxy from the Empire's world-destroying battle-station, while also attempting to rescue Princess Leia from the evil Darth Vader.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Mark Hamill",
				"character": "Luke Skywalker"
			},
			{
				"actor": "Harrison Ford",
				"character": "Han Solo"
			},
			{
				"actor": "Carrie Fisher",
				"character": "Princess Leia Organa"
			},
			{
				"actor": "Peter Cushing",
				"character": "Grand Moff Tarkin"
			},
			{
				"actor": "Alec Guinness",
				"character": "Ben Obi-Wan Kenobi"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Cidade de Deus",
		"description": "Two boys growing up in a violent neighborhood of Rio de Janeiro take different paths: one becomes a photographer, the other a drug dealer.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Alexandre Rodrigues",
				"character": "Buscapé - Rocket"
			},
			{
				"actor": "Leandro Firmino",
				"character": "Zé Pequeno - Li'l Zé"
			},
			{
				"actor": "Phellipe Haagensen",
				"character": "Bené - Benny"
			},
			{
				"actor": "Douglas Silva",
				"character": "Dadinho - Li'l Dice"
			},
			{
				"actor": "Jonathan Haagensen",
				"character": "Cabeleira - Shaggy"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Se7en",
		"description": "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Morgan Freeman",
				"character": "Somerset"
			},
			{
				"actor": "Andrew Kevin Walker",
				"character": "Dead Man at 1st Crime Scene"
			},
			{
				"actor": "Kevin Spacey",
				"character": "John Doe"
			},
			{
				"actor": "Daniel Zacapa",
				"character": "Detective Taylor"
			},
			{
				"actor": "Brad Pitt",
				"character": "Mills"
			}
		],
		"rating": 8.6
	},
	{
		"title": "The Silence of the Lambs",
		"description": "A young F.B.I. cadet must confide in an incarcerated and manipulative killer to receive his help on catching another serial killer who skins his victims.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Jodie Foster",
				"character": "Clarice Starling"
			},
			{
				"actor": "Lawrence A. Bonney",
				"character": "FBI Instructor"
			},
			{
				"actor": "Kasi Lemmons",
				"character": "Ardelia Mapp"
			},
			{
				"actor": "Lawrence T. Wrentz",
				"character": "Agent Burroughs"
			},
			{
				"actor": "Scott Glenn",
				"character": "Jack Crawford"
			}
		],
		"rating": 8.6
	},
	{
		"title": "It's a Wonderful Life",
		"description": "An angel is sent from Heaven to help a desperately frustrated businessman by showing him what life would have been like if he had never existed.",
		"genres": [
			"Drama",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "James Stewart",
				"character": "George Bailey"
			},
			{
				"actor": "Donna Reed",
				"character": "Mary Hatch"
			},
			{
				"actor": "Lionel Barrymore",
				"character": "Mr. Potter"
			},
			{
				"actor": "Thomas Mitchell",
				"character": "Uncle Billy"
			},
			{
				"actor": "Henry Travers",
				"character": "Clarence"
			}
		],
		"rating": 8.6
	},
	{
		"title": "La vita è bella",
		"description": "When an open-minded Jewish librarian and his son become victims of the Holocaust, he uses a perfect mixture of will, humor and imagination to protect his son from the dangers around their camp.",
		"genres": [
			"Comedy",
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Roberto Benigni",
				"character": "Guido"
			},
			{
				"actor": "Nicoletta Braschi",
				"character": "Dora"
			},
			{
				"actor": "Giorgio Cantarini",
				"character": "Giosué"
			},
			{
				"actor": "Giustino Durano",
				"character": "Zio"
			},
			{
				"actor": "Sergio Bini Bustric",
				"character": "Ferruccio"
			}
		],
		"rating": 8.6
	},
	{
		"title": "The Usual Suspects",
		"description": "A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which began when five criminals met at a seemingly random police lineup.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Stephen Baldwin",
				"character": "McManus"
			},
			{
				"actor": "Gabriel Byrne",
				"character": "Keaton"
			},
			{
				"actor": "Benicio Del Toro",
				"character": "Fenster"
			},
			{
				"actor": "Kevin Pollak",
				"character": "Hockney"
			},
			{
				"actor": "Kevin Spacey",
				"character": "Verbal"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Léon",
		"description": "Mathilda, a 12-year-old girl, is reluctantly taken in by Léon, a professional assassin, after her family is murdered. Léon and Mathilda form an unusual relationship, as she becomes his protégée and learns the assassin's trade.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Jean Reno",
				"character": "Léon"
			},
			{
				"actor": "Gary Oldman",
				"character": "Stansfield"
			},
			{
				"actor": "Natalie Portman",
				"character": "Mathilda"
			},
			{
				"actor": "Danny Aiello",
				"character": "Tony"
			},
			{
				"actor": "Peter Appel",
				"character": "Malky"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Sen to Chihiro no kamikakushi",
		"description": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
		"genres": [
			"Animation",
			"Adventure",
			"Family",
			"Fantasy",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Rumi Hiiragi",
				"character": "Chihiro Ogino / Sen"
			},
			{
				"actor": "Miyu Irino",
				"character": "Haku"
			},
			{
				"actor": "Mari Natsuki",
				"character": "Yubaba / Zeniba"
			},
			{
				"actor": "Takashi Naitô",
				"character": "Akio Ogino"
			},
			{
				"actor": "Yasuko Sawaguchi",
				"character": "Yûko Ogino"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Saving Private Ryan",
		"description": "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Tom Hanks",
				"character": "Captain Miller"
			},
			{
				"actor": "Tom Sizemore",
				"character": "Sergeant Horvath"
			},
			{
				"actor": "Edward Burns",
				"character": "Private Reiben"
			},
			{
				"actor": "Barry Pepper",
				"character": "Private Jackson"
			},
			{
				"actor": "Adam Goldberg",
				"character": "Private Mellish"
			}
		],
		"rating": 8.6
	},
	{
		"title": "C'era una volta il West",
		"description": "A mysterious stranger with a harmonica joins forces with a notorious desperado to protect a beautiful widow from a ruthless assassin working for the railroad.",
		"genres": [
			"Western"
		],
		"cast": [
			{
				"actor": "Claudia Cardinale",
				"character": "Jill McBain"
			},
			{
				"actor": "Henry Fonda",
				"character": "Frank"
			},
			{
				"actor": "Jason Robards",
				"character": "Manuel 'Cheyenne' Gutiérrez"
			},
			{
				"actor": "Charles Bronson",
				"character": "Harmonica"
			},
			{
				"actor": "Gabriele Ferzetti",
				"character": "Morton - Railroad Baron"
			}
		],
		"rating": 8.6
	},
	{
		"title": "American History X",
		"description": "A former neo-nazi skinhead tries to prevent his younger brother from going down the same wrong path that he did.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Edward Norton",
				"character": "Derek Vinyard"
			},
			{
				"actor": "Edward Furlong",
				"character": "Danny Vinyard"
			},
			{
				"actor": "Beverly D'Angelo",
				"character": "Doris Vinyard"
			},
			{
				"actor": "Jennifer Lien",
				"character": "Davina Vinyard"
			},
			{
				"actor": "Ethan Suplee",
				"character": "Seth Ryan"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Interstellar",
		"description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
		"genres": [
			"Adventure",
			"Drama",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Ellen Burstyn",
				"character": "Murph"
			},
			{
				"actor": "Matthew McConaughey",
				"character": "Cooper"
			},
			{
				"actor": "Mackenzie Foy",
				"character": "Murph"
			},
			{
				"actor": "John Lithgow",
				"character": "Donald"
			},
			{
				"actor": "Timothée Chalamet",
				"character": "Tom"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Casablanca",
		"description": "In Casablanca in December 1941, a cynical American expatriate encounters a former lover, with unforeseen complications.",
		"genres": [
			"Drama",
			"Romance",
			"War"
		],
		"cast": [
			{
				"actor": "Humphrey Bogart",
				"character": "Rick Blaine"
			},
			{
				"actor": "Ingrid Bergman",
				"character": "Ilsa Lund"
			},
			{
				"actor": "Paul Henreid",
				"character": "Victor Laszlo"
			},
			{
				"actor": "Claude Rains",
				"character": "Captain Louis Renault"
			},
			{
				"actor": "Conrad Veidt",
				"character": "Major Heinrich Strasser"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Psycho",
		"description": "A Phoenix secretary embezzles $40,000 from her employer's client, goes on the run, and checks into a remote motel run by a young man under the domination of his mother.",
		"genres": [
			"Horror",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Anthony Perkins",
				"character": "Norman Bates"
			},
			{
				"actor": "Vera Miles",
				"character": "Lila Crane"
			},
			{
				"actor": "John Gavin",
				"character": "Sam Loomis"
			},
			{
				"actor": "Janet Leigh",
				"character": "Marion Crane"
			},
			{
				"actor": "Martin Balsam",
				"character": "Det. Milton Arbogast"
			}
		],
		"rating": 8.5
	},
	{
		"title": "City Lights",
		"description": "With the aid of a wealthy erratic tippler, a dewy-eyed tramp who has fallen in love with a sightless flower girl accumulates money to be able to help her medically.",
		"genres": [
			"Comedy",
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Virginia Cherrill",
				"character": "A Blind Girl"
			},
			{
				"actor": "Florence Lee",
				"character": "The Blind Girl's Grandmother"
			},
			{
				"actor": "Harry Myers",
				"character": "An Eccentric Millionaire"
			},
			{
				"actor": "Garcia Al Ernest",
				"character": "James - the Millionaire's Butler"
			},
			{
				"actor": "Hank Mann",
				"character": "A Prizefighter"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Green Mile",
		"description": "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.",
		"genres": [
			"Crime",
			"Drama",
			"Fantasy",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Tom Hanks",
				"character": "Paul Edgecomb"
			},
			{
				"actor": "David Morse",
				"character": "Brutus 'Brutal' Howell"
			},
			{
				"actor": "Michael Clarke Duncan",
				"character": "John Coffey"
			},
			{
				"actor": "Bonnie Hunt",
				"character": "Jan Edgecomb"
			},
			{
				"actor": "James Cromwell",
				"character": "Warden Hal Moores"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Intouchables",
		"description": "After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver.",
		"genres": [
			"Biography",
			"Comedy",
			"Drama"
		],
		"cast": [
			{
				"actor": "François Cluzet",
				"character": "Philippe"
			},
			{
				"actor": "Omar Sy",
				"character": "Driss"
			},
			{
				"actor": "Anne Le Ny",
				"character": "Yvonne"
			},
			{
				"actor": "Audrey Fleurot",
				"character": "Magalie"
			},
			{
				"actor": "Joséphine de Meaux",
				"character": "La DRH société de courses"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Modern Times",
		"description": "The Tramp struggles to live in modern industrial society with the help of a young homeless woman.",
		"genres": [
			"Comedy",
			"Drama",
			"Family",
			"Romance"
		],
		"cast": [
			{
				"actor": "Charles Chaplin",
				"character": "A Factory Worker"
			},
			{
				"actor": "Paulette Goddard",
				"character": "A Gamin"
			},
			{
				"actor": "Henry Bergman",
				"character": "Cafe Proprietor"
			},
			{
				"actor": "Tiny Sandford",
				"character": "Big Bill"
			},
			{
				"actor": "Chester Conklin",
				"character": "Mechanic"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Raiders of the Lost Ark",
		"description": "Archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis.",
		"genres": [
			"Action",
			"Adventure"
		],
		"cast": [
			{
				"actor": "Harrison Ford",
				"character": "Indy"
			},
			{
				"actor": "Karen Allen",
				"character": "Marion Ravenwood"
			},
			{
				"actor": "Paul Freeman",
				"character": "Dr. René Belloq"
			},
			{
				"actor": "Ronald Lacey",
				"character": "Major Arnold Toht"
			},
			{
				"actor": "John Rhys-Davies",
				"character": "Sallah"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Rear Window",
		"description": "A wheelchair-bound photographer spies on his neighbours from his apartment window and becomes convinced one of them has committed murder.",
		"genres": [
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "James Stewart",
				"character": "L.B. 'Jeff' Jefferies"
			},
			{
				"actor": "Grace Kelly",
				"character": "Lisa Carol Fremont"
			},
			{
				"actor": "Wendell Corey",
				"character": "Det. Lt. Thomas J. Doyle"
			},
			{
				"actor": "Thelma Ritter",
				"character": "Stella"
			},
			{
				"actor": "Raymond Burr",
				"character": "Lars Thorwald"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Pianist",
		"description": "A Polish Jewish musician struggles to survive the destruction of the Warsaw ghetto of World War II.",
		"genres": [
			"Biography",
			"Drama",
			"Music",
			"War"
		],
		"cast": [
			{
				"actor": "Adrien Brody",
				"character": "Wladyslaw Szpilman"
			},
			{
				"actor": "Emilia Fox",
				"character": "Dorota"
			},
			{
				"actor": "Michal Zebrowski",
				"character": "Jurek"
			},
			{
				"actor": "Ed Stoppard",
				"character": "Henryk"
			},
			{
				"actor": "Maureen Lipman",
				"character": "Mother"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Departed",
		"description": "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Leonardo DiCaprio",
				"character": "Billy"
			},
			{
				"actor": "Matt Damon",
				"character": "Colin Sullivan"
			},
			{
				"actor": "Jack Nicholson",
				"character": "Frank Costello"
			},
			{
				"actor": "Mark Wahlberg",
				"character": "Dignam"
			},
			{
				"actor": "Martin Sheen",
				"character": "Queenan"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Terminator 2: Judgment Day",
		"description": "A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her teenage son, John Connor, from a more advanced cyborg.",
		"genres": [
			"Action",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Arnold Schwarzenegger",
				"character": "The Terminator"
			},
			{
				"actor": "Linda Hamilton",
				"character": "Sarah Connor"
			},
			{
				"actor": "Edward Furlong",
				"character": "John Connor"
			},
			{
				"actor": "Robert Patrick",
				"character": "T-1000"
			},
			{
				"actor": "Earl Boen",
				"character": "Dr. Silberman"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Back to the Future",
		"description": "Marty McFly, a 17-year-old high school student, is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.",
		"genres": [
			"Adventure",
			"Comedy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Michael J. Fox",
				"character": "Marty McFly"
			},
			{
				"actor": "Christopher Lloyd",
				"character": "Dr. Emmett Brown"
			},
			{
				"actor": "Lea Thompson",
				"character": "Lorraine Baines"
			},
			{
				"actor": "Crispin Glover",
				"character": "George McFly"
			},
			{
				"actor": "Thomas F. Wilson",
				"character": "Biff Tannen"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Whiplash",
		"description": "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
		"genres": [
			"Drama",
			"Music"
		],
		"cast": [
			{
				"actor": "Miles Teller",
				"character": "Andrew"
			},
			{
				"actor": "J.K. Simmons",
				"character": "Fletcher"
			},
			{
				"actor": "Paul Reiser",
				"character": "Jim Neimann"
			},
			{
				"actor": "Melissa Benoist",
				"character": "Nicole"
			},
			{
				"actor": "Austin Stowell",
				"character": "Ryan"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Gladiator",
		"description": "When a Roman general is betrayed and his family murdered by an emperor's corrupt son, he comes to Rome as a gladiator to seek revenge.",
		"genres": [
			"Action",
			"Adventure",
			"Drama"
		],
		"cast": [
			{
				"actor": "Russell Crowe",
				"character": "Maximus"
			},
			{
				"actor": "Joaquin Phoenix",
				"character": "Commodus"
			},
			{
				"actor": "Connie Nielsen",
				"character": "Lucilla"
			},
			{
				"actor": "Oliver Reed",
				"character": "Proximo"
			},
			{
				"actor": "Richard Harris",
				"character": "Marcus Aurelius"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Memento",
		"description": "A man juggles searching for his wife's murderer and keeping his short-term memory loss from being an obstacle.",
		"genres": [
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Guy Pearce",
				"character": "Leonard"
			},
			{
				"actor": "Carrie-Anne Moss",
				"character": "Natalie"
			},
			{
				"actor": "Joe Pantoliano",
				"character": "Teddy"
			},
			{
				"actor": "Mark Boone Junior",
				"character": "Burt"
			},
			{
				"actor": "Russ Fega",
				"character": "Waiter"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Prestige",
		"description": "Two stage magicians engage in competitive one-upmanship in an attempt to create the ultimate stage illusion.",
		"genres": [
			"Drama",
			"Mystery",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Hugh Jackman",
				"character": "Robert Angier"
			},
			{
				"actor": "Christian Bale",
				"character": "Alfred Borden"
			},
			{
				"actor": "Michael Caine",
				"character": "Cutter"
			},
			{
				"actor": "Piper Perabo",
				"character": "Julia McCullough"
			},
			{
				"actor": "Rebecca Hall",
				"character": "Sarah"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Lion King",
		"description": "Lion cub and future king Simba searches for his identity. His eagerness to please others and penchant for testing his boundaries sometimes gets him into trouble.",
		"genres": [
			"Animation",
			"Adventure",
			"Drama",
			"Family",
			"Musical"
		],
		"cast": [
			{
				"actor": "Rowan Atkinson",
				"character": "Zazu"
			},
			{
				"actor": "Matthew Broderick",
				"character": "Simba"
			},
			{
				"actor": "Niketa Calame",
				"character": "Young Nala"
			},
			{
				"actor": "Jim Cummings",
				"character": "Ed"
			},
			{
				"actor": "Whoopi Goldberg",
				"character": "Shenzi"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Apocalypse Now",
		"description": "During the Vietnam War, Captain Willard is sent on a dangerous mission into Cambodia to assassinate a renegade colonel who has set himself up as a god among a local tribe.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Marlon Brando",
				"character": "Colonel Walter E. Kurtz"
			},
			{
				"actor": "Martin Sheen",
				"character": "Captain Benjamin L. Willard"
			},
			{
				"actor": "Robert Duvall",
				"character": "Lieutenant Colonel Bill Kilgore"
			},
			{
				"actor": "Frederic Forrest",
				"character": "Jay 'Chef' Hicks"
			},
			{
				"actor": "Sam Bottoms",
				"character": "Lance B. Johnson"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Alien",
		"description": "After a space merchant vessel perceives an unknown transmission as a distress call, its landing on the source moon finds one of the crew attacked by a mysterious life-form, and they soon realize that its life cycle has merely begun.",
		"genres": [
			"Horror",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Tom Skerritt",
				"character": "Dallas"
			},
			{
				"actor": "Sigourney Weaver",
				"character": "Ripley"
			},
			{
				"actor": "Veronica Cartwright",
				"character": "Lambert"
			},
			{
				"actor": "Harry Dean Stanton",
				"character": "Brett"
			},
			{
				"actor": "John Hurt",
				"character": "Kane"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Sunset Blvd.",
		"description": "A screenwriter is hired to rework a faded silent film star's script only to find himself developing a dangerous relationship.",
		"genres": [
			"Drama",
			"Film-Noir"
		],
		"cast": [
			{
				"actor": "William Holden",
				"character": "Joe Gillis"
			},
			{
				"actor": "Gloria Swanson",
				"character": "Norma Desmond"
			},
			{
				"actor": "Erich von Stroheim",
				"character": "Max Von Mayerling"
			},
			{
				"actor": "Nancy Olson",
				"character": "Betty Schaefer"
			},
			{
				"actor": "Fred Clark",
				"character": "Sheldrake"
			}
		],
		"rating": 8.5
	},
	{
		"title": "The Great Dictator",
		"description": "Dictator Adenoid Hynkel tries to expand his empire while a poor Jewish barber tries to avoid persecution from Hynkel's regime.",
		"genres": [
			"Comedy",
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Charles Chaplin",
				"character": "Hynkel - Dictator of Tomania / A Jewish Barber"
			},
			{
				"actor": "Jack Oakie",
				"character": "Napaloni - Dictator of Bacteria"
			},
			{
				"actor": "Reginald Gardiner",
				"character": "Schultz"
			},
			{
				"actor": "Henry Daniell",
				"character": "Garbitsch"
			},
			{
				"actor": "Billy Gilbert",
				"character": "Herring"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
		"description": "An insane general triggers a path to nuclear holocaust that a war room full of politicians and generals frantically try to stop.",
		"genres": [
			"Comedy"
		],
		"cast": [
			{
				"actor": "Peter Sellers",
				"character": "Group Capt. Lionel Mandrake / President Merkin Muffley / Dr. Strangelove"
			},
			{
				"actor": "George C. Scott",
				"character": "Gen. 'Buck' Turgidson"
			},
			{
				"actor": "Sterling Hayden",
				"character": "Brig. Gen. Jack D. Ripper"
			},
			{
				"actor": "Keenan Wynn",
				"character": "Col. 'Bat' Guano"
			},
			{
				"actor": "Slim Pickens",
				"character": "Maj. 'King' Kong"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Nuovo Cinema Paradiso",
		"description": "A filmmaker recalls his childhood, when he fell in love with the movies at his village's theater and formed a deep friendship with the theater's projectionist.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Antonella Attili",
				"character": "Maria Di Vita - Younger"
			},
			{
				"actor": "Enzo Cannavale",
				"character": "Spaccafico"
			},
			{
				"actor": "Isa Danieli",
				"character": "Anna"
			},
			{
				"actor": "Leo Gullotta",
				"character": "Usher"
			},
			{
				"actor": "Marco Leonardi",
				"character": "Salvatore 'Totò' Di Vita - Teenager"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Das Leben der Anderen",
		"description": "In 1984 East Berlin, an agent of the secret police, conducting surveillance on a writer and his lover, finds himself becoming increasingly absorbed by their lives.",
		"genres": [
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Martina Gedeck",
				"character": "Christa-Maria Sieland"
			},
			{
				"actor": "Ulrich Mühe",
				"character": "Hauptmann Gerd Wiesler"
			},
			{
				"actor": "Sebastian Koch",
				"character": "Georg Dreyman"
			},
			{
				"actor": "Ulrich Tukur",
				"character": "Oberstleutnant Anton Grubitz"
			},
			{
				"actor": "Thomas Thieme",
				"character": "Minister Bruno Hempf"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Hotaru no haka",
		"description": "A young boy and his little sister struggle to survive in Japan during World War II.",
		"genres": [
			"Animation",
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Tsutomu Tatsumi",
				"character": "Seita"
			},
			{
				"actor": "Ayano Shiraishi",
				"character": "Setsuko"
			},
			{
				"actor": "Yoshiko Shinohara",
				"character": "Mother"
			},
			{
				"actor": "Akemi Yamaguchi",
				"character": "Aunt"
			},
			{
				"actor": "Tadashi Nakamura as"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Paths of Glory",
		"description": "After refusing to attack an enemy position, a general accuses the soldiers of cowardice and their commanding officer must defend them.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Kirk Douglas",
				"character": "Col. Dax"
			},
			{
				"actor": "Ralph Meeker",
				"character": "Cpl. Philippe Paris"
			},
			{
				"actor": "Adolphe Menjou",
				"character": "Gen. George Broulard"
			},
			{
				"actor": "George Macready",
				"character": "Gen. Paul Mireau"
			},
			{
				"actor": "Wayne Morris",
				"character": "Lt. Roget"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Django Unchained",
		"description": "With the help of a German bounty hunter , a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.",
		"genres": [
			"Drama",
			"Western"
		],
		"cast": [
			{
				"actor": "Jamie Foxx",
				"character": "Django"
			},
			{
				"actor": "Christoph Waltz",
				"character": "Dr. King Schultz"
			},
			{
				"actor": "Leonardo DiCaprio",
				"character": "Calvin Candie"
			},
			{
				"actor": "Kerry Washington",
				"character": "Broomhilda von Shaft"
			},
			{
				"actor": "Samuel L. Jackson",
				"character": "Stephen"
			}
		],
		"rating": 8.4
	},
	{
		"title": "The Shining",
		"description": "A family heads to an isolated hotel for the winter where an evil and spiritual presence influences the father into violence, while his psychic son sees horrific forebodings from the past and of the future.",
		"genres": [
			"Drama",
			"Horror"
		],
		"cast": [
			{
				"actor": "Jack Nicholson",
				"character": "Jack Torrance"
			},
			{
				"actor": "Shelley Duvall",
				"character": "Wendy Torrance"
			},
			{
				"actor": "Danny Lloyd",
				"character": "Danny"
			},
			{
				"actor": "Scatman Crothers",
				"character": "Hallorann"
			},
			{
				"actor": "Barry Nelson",
				"character": "Ullman"
			}
		],
		"rating": 8.4
	},
	{
		"title": "WALL·E",
		"description": "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
		"genres": [
			"Animation",
			"Adventure",
			"Family",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Ben Burtt",
				"character": "WALL·E / M-O / Robots"
			},
			{
				"actor": "Elissa Knight",
				"character": "EVE"
			},
			{
				"actor": "Jeff Garlin",
				"character": "Captain"
			},
			{
				"actor": "Fred Willard",
				"character": "Shelby Forthright"
			},
			{
				"actor": "MacInTalk",
				"character": "AUTO"
			}
		],
		"rating": 8.4
	},
	{
		"title": "American Beauty",
		"description": "A sexually frustrated suburban father has a mid-life crisis after becoming infatuated with his daughter's best friend.",
		"genres": [
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Kevin Spacey",
				"character": "Lester Burnham"
			},
			{
				"actor": "Annette Bening",
				"character": "Carolyn Burnham"
			},
			{
				"actor": "Thora Birch",
				"character": "Jane Burnham"
			},
			{
				"actor": "Wes Bentley",
				"character": "Ricky Fitts"
			},
			{
				"actor": "Mena Suvari",
				"character": "Angela Hayes"
			}
		],
		"rating": 8.4
	},
	{
		"title": "The Dark Knight Rises",
		"description": "Eight years after the Joker's reign of anarchy, the Dark Knight, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City, now on the edge of total annihilation, from the brutal guerrilla terrorist Bane.",
		"genres": [
			"Action",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Christian Bale",
				"character": "Bruce Wayne"
			},
			{
				"actor": "Gary Oldman",
				"character": "Commissioner Gordon"
			},
			{
				"actor": "Tom Hardy",
				"character": "Bane"
			},
			{
				"actor": "Joseph Gordon-Levitt",
				"character": "Blake"
			},
			{
				"actor": "Anne Hathaway",
				"character": "Selina"
			}
		],
		"rating": 8.5
	},
	{
		"title": "Mononoke-hime",
		"description": "On a journey to find the cure for a Tatarigami's curse, Ashitaka finds himself in the middle of a war between the forest gods and Tatara, a mining colony. In this quest he also meets San, the Mononoke Hime.",
		"genres": [
			"Animation",
			"Adventure",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Billy Crudup",
				"character": "Ashitaka"
			},
			{
				"actor": "Billy Bob Thornton",
				"character": "Jigo"
			},
			{
				"actor": "Minnie Driver",
				"character": "Lady Eboshi"
			},
			{
				"actor": "John DiMaggio",
				"character": "Gonza"
			},
			{
				"actor": "Claire Danes",
				"character": "San"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Aliens",
		"description": "The moon from  (1979) has been colonized, but contact is lost. This time, the rescue team has impressive firepower, but will it be enough?",
		"genres": [
			"Action",
			"Adventure",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Sigourney Weaver",
				"character": "Ripley"
			},
			{
				"actor": "Carrie Henn",
				"character": "Newt"
			},
			{
				"actor": "Michael Biehn",
				"character": "Corporal Hicks"
			},
			{
				"actor": "Paul Reiser",
				"character": "Burke"
			},
			{
				"actor": "Lance Henriksen",
				"character": "Bishop"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Oldeuboi",
		"description": "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.",
		"genres": [
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Min-sik Choi",
				"character": "Dae-su Oh"
			},
			{
				"actor": "Ji-tae Yu",
				"character": "Woo-jin Lee"
			},
			{
				"actor": "Hye-jeong Kang",
				"character": "Mi-do"
			},
			{
				"actor": "Dae-han Ji",
				"character": "No Joo-hwan"
			},
			{
				"actor": "Dal-su Oh",
				"character": "Park Cheol-woong"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Once Upon a Time in America",
		"description": "A former Prohibition-era Jewish gangster returns to the Lower East Side of Manhattan over thirty years later, where he once again must confront the ghosts and regrets of his old life.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Robert De Niro",
				"character": "David 'Noodles' Aaronson"
			},
			{
				"actor": "James Woods",
				"character": "Maximilian 'Max' Bercovicz"
			},
			{
				"actor": "Elizabeth McGovern",
				"character": "Deborah Gelly"
			},
			{
				"actor": "Joe Pesci",
				"character": "Frankie Manoldi"
			},
			{
				"actor": "Burt Young",
				"character": "Joe"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Witness for the Prosecution",
		"description": "A veteran British barrister must defend his client in a murder trial that has surprise after surprise.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Tyrone Power",
				"character": "Leonard Vole"
			},
			{
				"actor": "Marlene Dietrich",
				"character": "Christine"
			},
			{
				"actor": "Charles Laughton",
				"character": "Sir Wilfrid Roberts"
			},
			{
				"actor": "Elsa Lanchester",
				"character": "Miss Plimsoll"
			},
			{
				"actor": "John Williams",
				"character": "Brogan-Moore"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Das Boot",
		"description": "The claustrophobic world of a WWII German U-boat; boredom, filth, and sheer terror.",
		"genres": [
			"Adventure",
			"Drama",
			"Thriller",
			"War"
		],
		"cast": [
			{
				"actor": "Jürgen Prochnow",
				"character": "Capt.-Lt. Henrich Lehmann-Willenbrock - Der Alte"
			},
			{
				"actor": "Herbert Grönemeyer",
				"character": "Lt. Werner - Correspondent"
			},
			{
				"actor": "Klaus Wennemann",
				"character": "Chief Engineer Fritz Grade - Der Leitende-Der LI"
			},
			{
				"actor": "Hubertus Bengsch",
				"character": "1st Lieutenant - Number One-1WO"
			},
			{
				"actor": "Martin Semmelrogge",
				"character": "2nd Lieutenant - 2WO"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Citizen Kane",
		"description": "Following the death of a publishing tycoon, news reporters scramble to discover the meaning of his final utterance.",
		"genres": [
			"Drama",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Joseph Cotten",
				"character": "Jedediah Leland / Screening Room Reporter"
			},
			{
				"actor": "Dorothy Comingore",
				"character": "Susan Alexander Kane"
			},
			{
				"actor": "Agnes Moorehead",
				"character": "Mary Kane"
			},
			{
				"actor": "Ruth Warrick",
				"character": "Emily Monroe Norton Kane"
			},
			{
				"actor": "Ray Collins",
				"character": "James W. Gettys"
			}
		],
		"rating": 8.4
	},
	{
		"title": "North by Northwest",
		"description": "A hapless New York advertising executive is mistaken for a government agent by a group of foreign spies, and is pursued across the country while he looks for a way to survive.",
		"genres": [
			"Action",
			"Adventure",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Cary Grant",
				"character": "Roger O. Thornhill"
			},
			{
				"actor": "Eva Marie Saint",
				"character": "Eve Kendall"
			},
			{
				"actor": "James Mason",
				"character": "Phillip Vandamm"
			},
			{
				"actor": "Jessie Royce Landis",
				"character": "Clara Thornhill"
			},
			{
				"actor": "Leo G. Carroll",
				"character": "The Professor"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Vertigo",
		"description": "A San Francisco detective suffering from acrophobia investigates the strange activities of an old friend's wife, all the while becoming dangerously obsessed with her.",
		"genres": [
			"Mystery",
			"Romance",
			"Thriller"
		],
		"cast": [
			{
				"actor": "James Stewart",
				"character": "John 'Scottie' Ferguson"
			},
			{
				"actor": "Kim Novak",
				"character": "Madeleine Elster / Judy Barton"
			},
			{
				"actor": "Barbara Bel Geddes",
				"character": "Midge Wood"
			},
			{
				"actor": "Tom Helmore",
				"character": "Gavin Elster"
			},
			{
				"actor": "Henry Jones",
				"character": "Coroner"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Star Wars: Episode VI - Return of the Jedi",
		"description": "After rescuing Han Solo from the palace of Jabba the Hutt, the rebels attempt to destroy the second Death Star, while Luke struggles to make Vader return from the dark side of the Force.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Mark Hamill",
				"character": "Luke Skywalker"
			},
			{
				"actor": "Harrison Ford",
				"character": "Han Solo"
			},
			{
				"actor": "Carrie Fisher",
				"character": "Princess Leia"
			},
			{
				"actor": "Billy Dee Williams",
				"character": "Lando Calrissian"
			},
			{
				"actor": "Anthony Daniels",
				"character": "C-3PO"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Dangal",
		"description": "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
		"genres": [
			"Action",
			"Biography",
			"Drama",
			"Sport"
		],
		"cast": [
			{
				"actor": "Aamir Khan",
				"character": "Mahavir Singh Phogat"
			},
			{
				"actor": "Sakshi Tanwar",
				"character": "Daya Kaur"
			},
			{
				"actor": "Fatima Sana Shaikh",
				"character": "Geeta Phogat"
			},
			{
				"actor": "Sanya Malhotra",
				"character": "Babita Kumari"
			},
			{
				"actor": "Aparshakti Khurana",
				"character": "Omkar"
			}
		],
		"rating": 8.7
	},
	{
		"title": "Reservoir Dogs",
		"description": "After a simple jewelry heist goes terribly wrong, the surviving criminals begin to suspect that one of them is a police informant.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Harvey Keitel",
				"character": "Mr. White - Larry Dimmick"
			},
			{
				"actor": "Tim Roth",
				"character": "Mr. Orange - Freddy Newandyke"
			},
			{
				"actor": "Michael Madsen",
				"character": "Mr. Blonde - Vic Vega"
			},
			{
				"actor": "Chris Penn",
				"character": "Nice Guy Eddie Cabot"
			},
			{
				"actor": "Steve Buscemi",
				"character": "Mr. Pink"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Braveheart",
		"description": "When his secret bride is executed for assaulting an English soldier who tried to rape her, Sir William Wallace begins a revolt against King Edward I of England.",
		"genres": [
			"Biography",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "James Robinson",
				"character": "Young William"
			},
			{
				"actor": "Sean Lawlor",
				"character": "Malcolm Wallace"
			},
			{
				"actor": "Sandy Nelson",
				"character": "John Wallace"
			},
			{
				"actor": "James Cosmo",
				"character": "Campbell"
			},
			{
				"actor": "Sean McGinley",
				"character": "MacClannough"
			}
		],
		"rating": 8.4
	},
	{
		"title": "M",
		"description": "When the police in a German city are unable to catch a child-murderer, other criminals join in the manhunt.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Peter Lorre",
				"character": "Hans Beckert"
			},
			{
				"actor": "Ellen Widmann",
				"character": "Frau Beckmann"
			},
			{
				"actor": "Inge Landgut",
				"character": "Elsie Beckmann"
			},
			{
				"actor": "Otto Wernicke",
				"character": "Inspector Karl Lohmann"
			},
			{
				"actor": "Theodor Loos",
				"character": "Inspector Groeber"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Requiem for a Dream",
		"description": "The drug-induced utopias of four Coney Island people are shattered when their addictions run deep.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Ellen Burstyn",
				"character": "Sara Goldfarb"
			},
			{
				"actor": "Jared Leto",
				"character": "Harry Goldfarb"
			},
			{
				"actor": "Jennifer Connelly",
				"character": "Marion Silver"
			},
			{
				"actor": "Marlon Wayans",
				"character": "Tyrone C. Love"
			},
			{
				"actor": "Christopher McDonald",
				"character": "Tappy Tibbons"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Le fabuleux destin d'Amélie Poulain",
		"description": "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
		"genres": [
			"Comedy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Audrey Tautou",
				"character": "Amélie Poulain"
			},
			{
				"actor": "Mathieu Kassovitz",
				"character": "Nino Quincampoix"
			},
			{
				"actor": "Rufus",
				"character": "Raphaël Poulain"
			},
			{
				"actor": "Lorella Cravotta",
				"character": "Amandine Poulain"
			},
			{
				"actor": "Serge Merlin",
				"character": "Raymond Dufayel"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Taare Zameen Par",
		"description": "An eight-year-old boy is thought to be a lazy trouble-maker, until the new art teacher has the patience and compassion to discover the real problem behind his struggles in school.",
		"genres": [
			"Drama",
			"Family",
			"Music"
		],
		"cast": [
			{
				"actor": "Darsheel Safary",
				"character": "Ishaan Awasthi"
			},
			{
				"actor": "Aamir Khan",
				"character": "Ram Shankar Nikumbh"
			},
			{
				"actor": "Tanay Chheda",
				"character": "Rajan Damodaran"
			},
			{
				"actor": "Sachet Engineer",
				"character": "Yohan Awasthi"
			},
			{
				"actor": "Tisca Chopra",
				"character": "Maya Awasthi"
			}
		],
		"rating": 8.5
	},
	{
		"title": "A Clockwork Orange",
		"description": "In future Britain, Alex DeLarge, a charismatic and psycopath delinquent, who likes to practice crimes and ultra-violence with his gang, is jailed and volunteers for an experimental aversion therapy developed by the government in an effort to solve society's crime problem - but not all goes according to plan.",
		"genres": [
			"Crime",
			"Drama",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Malcolm McDowell",
				"character": "Alex"
			},
			{
				"actor": "Patrick Magee",
				"character": "Mr. Alexander"
			},
			{
				"actor": "Michael Bates",
				"character": "Chief Guard"
			},
			{
				"actor": "Warren Clarke",
				"character": "Dim"
			},
			{
				"actor": "John Clive",
				"character": "Stage Actor"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Lawrence of Arabia",
		"description": "The story of , the English officer who successfully united and led the diverse, often warring, Arab tribes during World War I in order to fight the Turks.",
		"genres": [
			"Adventure",
			"Biography",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "Peter O'Toole",
				"character": "T.E. Lawrence"
			},
			{
				"actor": "Alec Guinness",
				"character": "Prince Feisal"
			},
			{
				"actor": "Anthony Quinn",
				"character": "Auda Abu Tayi"
			},
			{
				"actor": "Jack Hawkins",
				"character": "General Allenby"
			},
			{
				"actor": "Omar Sharif",
				"character": "Sherif Ali"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Taxi Driver",
		"description": "A mentally unstable Vietnam War veteran works as a night-time taxi driver in New York City where the perceived decadence and sleaze feeds his urge for violent action, while attempting to save a preadolescent prostitute in the process.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Diahnne Abbott",
				"character": "Concession Girl"
			},
			{
				"actor": "Frank Adu",
				"character": "Angry Black Policeman"
			},
			{
				"actor": "Victor Argo",
				"character": "Melio"
			},
			{
				"actor": "Gino Ardito",
				"character": "Policeman At Rally"
			},
			{
				"actor": "Garth Avery",
				"character": "Iris' Friend"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Double Indemnity",
		"description": "An insurance representative lets himself be talked into a murder/insurance fraud scheme that arouses an insurance investigator's suspicions.",
		"genres": [
			"Crime",
			"Drama",
			"Film-Noir",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Fred MacMurray",
				"character": "Walter Neff"
			},
			{
				"actor": "Barbara Stanwyck",
				"character": "Phyllis Dietrichson"
			},
			{
				"actor": "Edward G. Robinson",
				"character": "Barton Keyes"
			},
			{
				"actor": "Porter Hall",
				"character": "Mr. Jackson"
			},
			{
				"actor": "Jean Heather",
				"character": "Lola Dietrichson"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Eternal Sunshine of the Spotless Mind",
		"description": "When their relationship turns sour, a couple undergoes a procedure to have each other erased from their memories. But it is only through the process of loss that they discover what they had to begin with.",
		"genres": [
			"Drama",
			"Romance",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Jim Carrey",
				"character": "Joel Barish"
			},
			{
				"actor": "Kate Winslet",
				"character": "Clementine Kruczynski"
			},
			{
				"actor": "Gerry Robert Byrne",
				"character": "Train Conductor"
			},
			{
				"actor": "Elijah Wood",
				"character": "Patrick"
			},
			{
				"actor": "Thomas Jay Ryan",
				"character": "Frank"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Amadeus",
		"description": "The incredible story of , told by his peer and secret rival  - now confined to an insane asylum.",
		"genres": [
			"Biography",
			"Drama",
			"History",
			"Music"
		],
		"cast": [
			{
				"actor": "F. Murray Abraham",
				"character": "Antonio Salieri"
			},
			{
				"actor": "Tom Hulce",
				"character": "Wolfgang Amadeus Mozart"
			},
			{
				"actor": "Elizabeth Berridge",
				"character": "Constanze Mozart"
			},
			{
				"actor": "Roy Dotrice",
				"character": "Leopold Mozart"
			},
			{
				"actor": "Simon Callow",
				"character": "Emanuel Schikaneder"
			}
		],
		"rating": 8.3
	},
	{
		"title": "To Kill a Mockingbird",
		"description": "Atticus Finch, a lawyer in the Depression-era South, defends a black man against an undeserved rape charge, and his children against prejudice.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Gregory Peck",
				"character": "Atticus Finch"
			},
			{
				"actor": "John Megna",
				"character": "Dill Harris"
			},
			{
				"actor": "Frank Overton",
				"character": "Sheriff Heck Tate"
			},
			{
				"actor": "Rosemary Murphy",
				"character": "Maudie Atkinson"
			},
			{
				"actor": "Ruth White",
				"character": "Mrs. Dubose"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Toy Story 3",
		"description": "The toys are mistakenly delivered to a day-care center instead of the attic right before Andy leaves for college, and it's up to Woody to convince the other toys that they weren't abandoned and to return home.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Tom Hanks",
				"character": "Woody"
			},
			{
				"actor": "Tim Allen",
				"character": "Buzz Lightyear"
			},
			{
				"actor": "Joan Cusack",
				"character": "Jessie"
			},
			{
				"actor": "Ned Beatty",
				"character": "Lotso"
			},
			{
				"actor": "Don Rickles",
				"character": "Mr. Potato Head"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Full Metal Jacket",
		"description": "A pragmatic U.S. Marine observes the dehumanizing effects the Vietnam War has on his fellow recruits from their brutal boot camp training to the bloody street fighting in Hue.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Matthew Modine",
				"character": "Pvt. J.T. 'Joker' Davis"
			},
			{
				"actor": "Adam Baldwin",
				"character": "Animal Mother"
			},
			{
				"actor": "Vincent D'Onofrio",
				"character": "Pvt. Leonard 'Gomer Pyle' Lawrence"
			},
			{
				"actor": "R. Lee Ermey",
				"character": "Gny. Sgt. Hartman"
			},
			{
				"actor": "Dorian Harewood",
				"character": "Eightball"
			}
		],
		"rating": 8.3
	},
	{
		"title": "2001: A Space Odyssey",
		"description": "Humanity finds a mysterious, obviously artificial object buried beneath the Lunar surface and, with the intelligent computer H.A.L. 9000, sets off on a quest.",
		"genres": [
			"Adventure",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Keir Dullea",
				"character": "Dr. Dave Bowman"
			},
			{
				"actor": "Gary Lockwood",
				"character": "Dr. Frank Poole"
			},
			{
				"actor": "William Sylvester",
				"character": "Dr. Heywood R. Floyd"
			},
			{
				"actor": "Daniel Richter",
				"character": "Moon-Watcher"
			},
			{
				"actor": "Leonard Rossiter",
				"character": "Dr. Andrei Smyslov"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Singin' in the Rain",
		"description": "A silent film production company and cast make a difficult transition to sound.",
		"genres": [
			"Comedy",
			"Musical",
			"Romance"
		],
		"cast": [
			{
				"actor": "Gene Kelly",
				"character": "Don Lockwood"
			},
			{
				"actor": "Donald O'Connor",
				"character": "Cosmo Brown"
			},
			{
				"actor": "Debbie Reynolds",
				"character": "Kathy Selden"
			},
			{
				"actor": "Jean Hagen",
				"character": "Lina Lamont"
			},
			{
				"actor": "Millard Mitchell",
				"character": "R.F. Simpson"
			}
		],
		"rating": 8.3
	},
	{
		"title": "The Sting",
		"description": "In Chicago in September 1936, a young con man seeking revenge for his murdered partner teams up with a master of the big con to win a fortune from a criminal banker.",
		"genres": [
			"Comedy",
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Paul Newman",
				"character": "Henry Gondorff"
			},
			{
				"actor": "Robert Redford",
				"character": "Johnny Hooker"
			},
			{
				"actor": "Robert Shaw",
				"character": "Doyle Lonnegan"
			},
			{
				"actor": "Charles Durning",
				"character": "Lt. Wm. Snyder"
			},
			{
				"actor": "Ray Walston",
				"character": "J.J. Singleton"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Toy Story",
		"description": "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Tom Hanks",
				"character": "Woody"
			},
			{
				"actor": "Tim Allen",
				"character": "Buzz Lightyear"
			},
			{
				"actor": "Don Rickles",
				"character": "Mr. Potato Head"
			},
			{
				"actor": "Jim Varney",
				"character": "Slinky Dog"
			},
			{
				"actor": "Wallace Shawn",
				"character": "Rex"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Ladri di biciclette",
		"description": "In post-war Italy, a working-class man's bicycle is stolen. He and his son set out to find it.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Lamberto Maggiorani",
				"character": "Antonio"
			},
			{
				"actor": "Enzo Staiola",
				"character": "Bruno"
			},
			{
				"actor": "Lianella Carell",
				"character": "Maria"
			},
			{
				"actor": "Elena Altieri",
				"character": "The Charitable Lady"
			},
			{
				"actor": "Gino Saltamerenda",
				"character": "Baiocco"
			}
		],
		"rating": 8.3
	},
	{
		"title": "The Kid",
		"description": "The Tramp cares for an abandoned child, but events put that relationship in jeopardy.",
		"genres": [
			"Comedy",
			"Drama",
			"Family"
		],
		"cast": [
			{
				"actor": "Carl Miller",
				"character": "The Man"
			},
			{
				"actor": "Edna Purviance",
				"character": "The Woman"
			},
			{
				"actor": "Jackie Coogan",
				"character": "The Child"
			},
			{
				"actor": "Charles Chaplin",
				"character": "A Tramp"
			},
			{
				"actor": "Albert Austin",
				"character": "Man in Shelter"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Inglourious Basterds",
		"description": "In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner's vengeful plans for the same.",
		"genres": [
			"Adventure",
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Brad Pitt",
				"character": "Lt. Aldo Raine"
			},
			{
				"actor": "Mélanie Laurent",
				"character": "Shosanna"
			},
			{
				"actor": "Christoph Waltz",
				"character": "Col. Hans Landa"
			},
			{
				"actor": "Eli Roth",
				"character": "Sgt. Donny Donowitz"
			},
			{
				"actor": "Michael Fassbender",
				"character": "Lt. Archie Hicox"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Kimi no na wa",
		"description": "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
		"genres": [
			"Animation",
			"Drama",
			"Fantasy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Ryûnosuke Kamiki",
				"character": "Taki Tachibana"
			},
			{
				"actor": "Mone Kamishiraishi",
				"character": "Mitsuha Miyamizu"
			},
			{
				"actor": "Ryô Narita",
				"character": "Katsuhiko Teshigawara"
			},
			{
				"actor": "Aoi Yûki",
				"character": "Sayaka Natori"
			},
			{
				"actor": "Nobunaga Shimazaki",
				"character": "Tsukasa Fujii"
			}
		],
		"rating": 8.6
	},
	{
		"title": "3 Idiots",
		"description": "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them idiots.",
		"genres": [
			"Adventure",
			"Comedy",
			"Drama"
		],
		"cast": [
			{
				"actor": "Aamir Khan",
				"character": "'Rancho' Shamaldas Chanchad"
			},
			{
				"actor": "Madhavan",
				"character": "Farhan Qureshi"
			},
			{
				"actor": "Sharman Joshi",
				"character": "Raju Rastogi"
			},
			{
				"actor": "Kareena Kapoor Khan",
				"character": "Pia"
			},
			{
				"actor": "Boman Irani",
				"character": "Viru Sahastrabudhhe"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Snatch",
		"description": "Unscrupulous boxing promoters, violent bookmakers, a Russian gangster, incompetent amateur robbers, and supposedly Jewish jewelers fight to track down a priceless stolen diamond.",
		"genres": [
			"Comedy",
			"Crime"
		],
		"cast": [
			{
				"actor": "Benicio Del Toro",
				"character": "Franky Four Fingers"
			},
			{
				"actor": "Dennis Farina",
				"character": "Cousin Avi"
			},
			{
				"actor": "Vinnie Jones",
				"character": "Bullet-Tooth Tony"
			},
			{
				"actor": "Brad Pitt",
				"character": "Mickey O'Neil"
			},
			{
				"actor": "Rade Serbedzija",
				"character": "Boris the Blade"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Monty Python and the Holy Grail",
		"description": "King Arthur and his knights embark on a low-budget search for the Grail, encountering many, very silly obstacles.",
		"genres": [
			"Adventure",
			"Comedy",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Graham Chapman",
				"character": "King Arthur / Voice of God / Middle Head / Hiccoughing Guard"
			},
			{
				"actor": "John Cleese",
				"character": "Second Swallow-Savvy Guard / The Black Knight / Peasant 3 / Sir Lancelot the Brave / Taunting French Guard / Tim the Enchanter"
			},
			{
				"actor": "Eric Idle",
				"character": "Dead Collector / Peasant 1 / Sir Robin the Not-Quite-So-Brave-as-Sir Launcelot / First Swamp Castle Guard / Concorde / Roger the Shrubber / Brother Maynard"
			},
			{
				"actor": "Terry Gilliam",
				"character": "Patsy / Green Knight / Old Man from Scene 24 / Sir Bors / Animator / Gorrilla Hand"
			},
			{
				"actor": "Terry Jones",
				"character": "Dennis's Mother / Sir Bedevere / Left Head / Prince Herbert / Cartoon Scribe"
			}
		],
		"rating": 8.3
	},
	{
		"title": "L.A. Confidential",
		"description": "As corruption grows in 1950s LA, three policemen - one strait-laced, one brutal, and one sleazy - investigate a series of murders with their own brand of justice.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Kevin Spacey",
				"character": "Jack Vincennes"
			},
			{
				"actor": "Russell Crowe",
				"character": "Bud White"
			},
			{
				"actor": "Guy Pearce",
				"character": "Ed Exley"
			},
			{
				"actor": "James Cromwell",
				"character": "Dudley Smith"
			},
			{
				"actor": "Kim Basinger",
				"character": "Lynn Bracken"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Per qualche dollaro in più",
		"description": "Two bounty hunters with the same intentions team up to track down a Western outlaw.",
		"genres": [
			"Western"
		],
		"cast": [
			{
				"actor": "Clint Eastwood",
				"character": "Monco"
			},
			{
				"actor": "Lee Van Cleef",
				"character": "Col. Douglas Mortimer"
			},
			{
				"actor": "Gian Maria Volontè",
				"character": "El Indio"
			},
			{
				"actor": "Mario Brega",
				"character": "Member of Indio's Gang Nino"
			},
			{
				"actor": "Luigi Pistilli",
				"character": "Member of Indio's Gang Groggy"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Babam ve Oglum",
		"description": "The family of a left-wing journalist is torn apart after a military coup in 1980's Turkey.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Resit Kurt",
				"character": "Baris"
			},
			{
				"actor": "Fikret Kuskan",
				"character": "Sadik"
			},
			{
				"actor": "Çetin Tekindor",
				"character": "Hüseyin"
			},
			{
				"actor": "Furkan Turan",
				"character": "Kerem"
			},
			{
				"actor": "Hümeyra",
				"character": "Nuran"
			}
		],
		"rating": 8.6
	},
	{
		"title": "Jagten",
		"description": "A teacher lives a lonely life, all the while struggling over his son's custody. His life slowly gets better as he finds love and receives good news from his son, but his new luck is about to be brutally shattered by an innocent little lie.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Mads Mikkelsen",
				"character": "Lucas"
			},
			{
				"actor": "Thomas Bo Larsen",
				"character": "Theo"
			},
			{
				"actor": "Annika Wedderkopp",
				"character": "Klara"
			},
			{
				"actor": "Lasse Fogelstrøm",
				"character": "Marcus"
			},
			{
				"actor": "Susse Wold",
				"character": "Grethe"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Scarface",
		"description": "In Miami in 1980, a determined Cuban immigrant takes over a drug cartel and succumbs to greed.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Al Pacino",
				"character": "Tony Montana"
			},
			{
				"actor": "Steven Bauer",
				"character": "Manny Ribera"
			},
			{
				"actor": "Michelle Pfeiffer",
				"character": "Elvira Hancock"
			},
			{
				"actor": "Mary Elizabeth Mastrantonio",
				"character": "Gina Montana"
			},
			{
				"actor": "Robert Loggia",
				"character": "Frank Lopez"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Good Will Hunting",
		"description": "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Matt Damon",
				"character": "Will"
			},
			{
				"actor": "Ben Affleck",
				"character": "Chuckie"
			},
			{
				"actor": "Stellan Skarsgård",
				"character": "Lambeau"
			},
			{
				"actor": "John Mighton",
				"character": "Tom"
			},
			{
				"actor": "Rachel Majorowski",
				"character": "Krystyn"
			}
		],
		"rating": 8.3
	},
	{
		"title": "The Apartment",
		"description": "A man tries to rise in his company by letting its executives use his apartment for trysts, but complications and a romance of his own ensue.",
		"genres": [
			"Comedy",
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Jack Lemmon",
				"character": "C.C. Baxter"
			},
			{
				"actor": "Shirley MacLaine",
				"character": "Fran Kubelik"
			},
			{
				"actor": "Fred MacMurray",
				"character": "Jeff D. Sheldrake"
			},
			{
				"actor": "Ray Walston",
				"character": "Joe Dobisch"
			},
			{
				"actor": "Jack Kruschen",
				"character": "Dr. Dreyfuss"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Rashômon",
		"description": "A heinous crime and its aftermath are recalled from differing points of view.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Toshirô Mifune",
				"character": "Tajômaru"
			},
			{
				"actor": "Machiko Kyô",
				"character": "Masako Kanazawa"
			},
			{
				"actor": "Masayuki Mori",
				"character": "Takehiro Kanazawa"
			},
			{
				"actor": "Takashi Shimura",
				"character": "Woodcutter"
			},
			{
				"actor": "Minoru Chiaki",
				"character": "Priest"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Jodaeiye Nader az Simin",
		"description": "A married couple are faced with a difficult decision - to improve the life of their child by moving to another country or to stay in Iran and look after a deteriorating parent who has Alzheimer's disease.",
		"genres": [
			"Drama",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Peyman Moaadi",
				"character": "Nader"
			},
			{
				"actor": "Leila Hatami",
				"character": "Simin"
			},
			{
				"actor": "Sareh Bayat",
				"character": "Razieh"
			},
			{
				"actor": "Shahab Hosseini",
				"character": "Hojjat"
			},
			{
				"actor": "Sarina Farhadi",
				"character": "Termeh"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Metropolis",
		"description": "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working class prophet who predicts the coming of a savior to mediate their differences.",
		"genres": [
			"Drama",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Alfred Abel",
				"character": "Joh Fredersen"
			},
			{
				"actor": "Gustav Fröhlich",
				"character": "Freder - Joh Fredersen's Son"
			},
			{
				"actor": "Rudolf Klein-Rogge",
				"character": "C.A. Rotwang - the Inventor"
			},
			{
				"actor": "Fritz Rasp",
				"character": "The Thin Man"
			},
			{
				"actor": "Theodor Loos",
				"character": "Josaphat"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Indiana Jones and the Last Crusade",
		"description": "When Dr. Henry Jones Sr. suddenly goes missing while pursuing the Holy Grail, eminent archaeologist Indiana Jones must follow in his father's footsteps to stop the Nazis from getting their hands on the Holy Grail first.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Harrison Ford",
				"character": "Indiana Jones"
			},
			{
				"actor": "Sean Connery",
				"character": "Professor Henry Jones"
			},
			{
				"actor": "Denholm Elliott",
				"character": "Marcus Brody"
			},
			{
				"actor": "Alison Doody",
				"character": "Elsa"
			},
			{
				"actor": "John Rhys-Davies",
				"character": "Sallah"
			}
		],
		"rating": 8.3
	},
	{
		"title": "All About Eve",
		"description": "An ingenue insinuates herself into the company of an established but aging stage actress and her circle of theater friends.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Bette Davis",
				"character": "Margo Channing"
			},
			{
				"actor": "Anne Baxter",
				"character": "Eve Harrington"
			},
			{
				"actor": "George Sanders",
				"character": "Addison DeWitt"
			},
			{
				"actor": "Celeste Holm",
				"character": "Karen Richards"
			},
			{
				"actor": "Gary Merrill",
				"character": "Bill Simpson"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Yôjinbô",
		"description": "A crafty ronin comes to a town divided by two criminal gangs and decides to play them against each other to free the town.",
		"genres": [
			"Action",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Toshirô Mifune",
				"character": "Sanjuro Kuwabatake / The Samurai"
			},
			{
				"actor": "Tatsuya Nakadai",
				"character": "Unosuke - Gunfighter"
			},
			{
				"actor": "Yôko Tsukasa",
				"character": "Nui"
			},
			{
				"actor": "Isuzu Yamada",
				"character": "Orin"
			},
			{
				"actor": "Daisuke Katô",
				"character": "Inokichi - Ushitora's Rotund Brother"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Batman Begins",
		"description": "After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from the corruption that Scarecrow and the League of Shadows have cast upon it.",
		"genres": [
			"Action",
			"Adventure"
		],
		"cast": [
			{
				"actor": "Christian Bale",
				"character": "Bruce Wayne / Batman"
			},
			{
				"actor": "Michael Caine",
				"character": "Alfred"
			},
			{
				"actor": "Liam Neeson",
				"character": "Ducard"
			},
			{
				"actor": "Katie Holmes",
				"character": "Rachel Dawes"
			},
			{
				"actor": "Gary Oldman",
				"character": "Jim Gordon"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Up",
		"description": "Seventy-eight year old Carl Fredricksen travels to Paradise Falls in his home equipped with balloons, inadvertently taking a young stowaway.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Family"
		],
		"cast": [
			{
				"actor": "Edward Asner",
				"character": "Carl Fredricksen"
			},
			{
				"actor": "Christopher Plummer",
				"character": "Charles Muntz"
			},
			{
				"actor": "Jordan Nagai",
				"character": "Russell"
			},
			{
				"actor": "Bob Peterson",
				"character": "Dug / Alpha"
			},
			{
				"actor": "Delroy Lindo",
				"character": "Beta"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Some Like It Hot",
		"description": "When two male musicians witness a mob hit, they flee the state in an all-female band disguised as women, but further complications set in.",
		"genres": [
			"Comedy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Marilyn Monroe",
				"character": "Sugar Kane Kowalczyk"
			},
			{
				"actor": "Tony Curtis",
				"character": "Joe / Josephine / Shell Oil Junior"
			},
			{
				"actor": "Jack Lemmon",
				"character": "Jerry / Daphne"
			},
			{
				"actor": "George Raft",
				"character": "Spats Colombo"
			},
			{
				"actor": "Pat O'Brien",
				"character": "Detective Mulligan"
			}
		],
		"rating": 8.3
	},
	{
		"title": "The Treasure of the Sierra Madre",
		"description": "Fred Dobbs and Bob Curtin, two Americans searching for work in Mexico, convince an old prospector to help them mine for gold in the Sierra Madre Mountains.",
		"genres": [
			"Adventure",
			"Drama",
			"Western"
		],
		"cast": [
			{
				"actor": "Humphrey Bogart",
				"character": "Dobbs"
			},
			{
				"actor": "Walter Huston",
				"character": "Howard"
			},
			{
				"actor": "Tim Holt",
				"character": "Curtin"
			},
			{
				"actor": "Bruce Bennett",
				"character": "Cody"
			},
			{
				"actor": "Barton MacLane",
				"character": "McCormick"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Unforgiven",
		"description": "Retired Old West gunslinger William Munny reluctantly takes on one last job, with the help of his old partner and a young man.",
		"genres": [
			"Drama",
			"Western"
		],
		"cast": [
			{
				"actor": "Clint Eastwood",
				"character": "Bill Munny"
			},
			{
				"actor": "Gene Hackman",
				"character": "Little Bill Daggett"
			},
			{
				"actor": "Morgan Freeman",
				"character": "Ned Logan"
			},
			{
				"actor": "Richard Harris",
				"character": "English Bob"
			},
			{
				"actor": "Jaimz Woolvett",
				"character": "The 'Schofield Kid'"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Der Untergang",
		"description": "Traudl Junge, the final secretary for Adolf Hitler, tells of the Nazi dictator's final days in his Berlin bunker at the end of WWII.",
		"genres": [
			"Biography",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "Bruno Ganz",
				"character": "Adolf Hitler"
			},
			{
				"actor": "Alexandra Maria Lara",
				"character": "Traudl Junge"
			},
			{
				"actor": "Corinna Harfouch",
				"character": "Magda Goebbels"
			},
			{
				"actor": "Ulrich Matthes",
				"character": "Joseph Goebbels"
			},
			{
				"actor": "Juliane Köhler",
				"character": "Eva Braun"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Raging Bull",
		"description": "An emotionally self-destructive boxer's journey through life, as the violence and temper that leads him to the top in the ring destroys his life outside it.",
		"genres": [
			"Biography",
			"Drama",
			"Sport"
		],
		"cast": [
			{
				"actor": "Robert De Niro",
				"character": "Jake La Motta"
			},
			{
				"actor": "Cathy Moriarty",
				"character": "Vickie La Motta"
			},
			{
				"actor": "Joe Pesci",
				"character": "Joey"
			},
			{
				"actor": "Frank Vincent",
				"character": "Salvy"
			},
			{
				"actor": "Nicholas Colasanto",
				"character": "Tommy Como"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Die Hard",
		"description": "John McClane, officer of the NYPD, tries to save his wife Holly Gennaro and several others that were taken hostage by German terrorist Hans Gruber during a Christmas party at the Nakatomi Plaza in Los Angeles.",
		"genres": [
			"Action",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Bruce Willis",
				"character": "John McClane"
			},
			{
				"actor": "Bonnie Bedelia",
				"character": "Holly Gennaro McClane"
			},
			{
				"actor": "Reginald VelJohnson",
				"character": "Sgt. Al Powell"
			},
			{
				"actor": "Paul Gleason",
				"character": "Deputy Police Chief Dwayne T. Robinson"
			},
			{
				"actor": "William Atherton",
				"character": "Richard Thornburg"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Bacheha-Ye aseman",
		"description": "After a boy loses his sister's pair of shoes, he goes on a series of adventures in order to find them. When he can't, he tries a new way to win a new pair.",
		"genres": [
			"Drama",
			"Family"
		],
		"cast": [
			{
				"actor": "Mohammad Amir Naji",
				"character": "Ali's Father"
			},
			{
				"actor": "Amir Farrokh Hashemian",
				"character": "Ali"
			},
			{
				"actor": "Bahare Seddiqi",
				"character": "Zahra"
			},
			{
				"actor": "Nafise Jafar-Mohammadi",
				"character": "Roya"
			},
			{
				"actor": "Fereshte Sarabandi",
				"character": "Ali's Mother"
			}
		],
		"rating": 8.4
	},
	{
		"title": "The Third Man",
		"description": "Pulp novelist Holly Martins travels to shadowy, postwar Vienna, only to find himself investigating the mysterious death of an old friend, Harry Lime.",
		"genres": [
			"Film-Noir",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Joseph Cotten",
				"character": "Holly Martins"
			},
			{
				"actor": "Alida Valli",
				"character": "Anna Schmidt"
			},
			{
				"actor": "Orson Welles",
				"character": "Harry Lime"
			},
			{
				"actor": "Trevor Howard",
				"character": "Maj. Calloway"
			},
			{
				"actor": "Bernard Lee",
				"character": "Sgt. Paine"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Heat",
		"description": "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist, while both sides attempt to find balance between their personal lives with their professional lives.",
		"genres": [
			"Action",
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Al Pacino",
				"character": "Lt. Vincent Hanna"
			},
			{
				"actor": "Robert De Niro",
				"character": "Neil McCauley"
			},
			{
				"actor": "Val Kilmer",
				"character": "Chris Shiherlis"
			},
			{
				"actor": "Jon Voight",
				"character": "Nate"
			},
			{
				"actor": "Tom Sizemore",
				"character": "Michael Cheritto"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Great Escape",
		"description": "Allied prisoners of war plan for several hundred of their number to escape from a German camp during World War II.",
		"genres": [
			"Adventure",
			"Drama",
			"History",
			"Thriller",
			"War"
		],
		"cast": [
			{
				"actor": "Steve McQueen",
				"character": "Hilts 'The Cooler King'"
			},
			{
				"actor": "James Garner",
				"character": "Hendley 'The Scrounger'"
			},
			{
				"actor": "Richard Attenborough",
				"character": "Bartlett 'Big X'"
			},
			{
				"actor": "James Donald",
				"character": "Ramsey 'The SBO'"
			},
			{
				"actor": "Charles Bronson",
				"character": "Danny 'Tunnel King'"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Chinatown",
		"description": "A private detective hired to expose an adulterer finds himself caught up in a web of deceit, corruption, and murder.",
		"genres": [
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Jack Nicholson",
				"character": "J.J. Gittes"
			},
			{
				"actor": "Faye Dunaway",
				"character": "Evelyn Mulwray"
			},
			{
				"actor": "John Huston",
				"character": "Noah Cross"
			},
			{
				"actor": "Perry Lopez",
				"character": "Escobar"
			},
			{
				"actor": "John Hillerman",
				"character": "Yelburton"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Ikiru",
		"description": "A bureaucrat tries to find a meaning in his life after he discovers he has terminal cancer.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Takashi Shimura",
				"character": "Kanji Watanabe"
			},
			{
				"actor": "Shin'ichi Himori",
				"character": "Kimura"
			},
			{
				"actor": "Haruo Tanaka",
				"character": "Sakai"
			},
			{
				"actor": "Minoru Chiaki",
				"character": "Noguchi"
			},
			{
				"actor": "Miki Odagiri",
				"character": "employee Toyo Odagiri"
			}
		],
		"rating": 8.3
	},
	{
		"title": "El laberinto del fauno",
		"description": "In the falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.",
		"genres": [
			"Drama",
			"Fantasy",
			"War"
		],
		"cast": [
			{
				"actor": "Ivana Baquero",
				"character": "Ofelia"
			},
			{
				"actor": "Sergi López",
				"character": "Vidal"
			},
			{
				"actor": "Maribel Verdú",
				"character": "Mercedes"
			},
			{
				"actor": "Doug Jones",
				"character": "Fauno / Pale Man"
			},
			{
				"actor": "Ariadna Gil",
				"character": "Carmen"
			}
		],
		"rating": 8.2
	},
	{
		"title": "La La Land",
		"description": "A jazz pianist falls for an aspiring actress in Los Angeles.",
		"genres": [
			"Comedy",
			"Drama",
			"Music",
			"Musical",
			"Romance"
		],
		"cast": [
			{
				"actor": "Ryan Gosling",
				"character": "Sebastian"
			},
			{
				"actor": "Emma Stone",
				"character": "Mia"
			},
			{
				"actor": "Amiée Conn",
				"character": "Famous Actress"
			},
			{
				"actor": "Terry Walters",
				"character": "Linda"
			},
			{
				"actor": "Thom Shelton",
				"character": "Coffee Spiller"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Tonari no Totoro",
		"description": "When two girls move to the country to be near their ailing mother, they have adventures with the wondrous forest spirits who live nearby.",
		"genres": [
			"Animation",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Noriko Hidaka",
				"character": "Satsuki"
			},
			{
				"actor": "Chika Sakamoto",
				"character": "Mei"
			},
			{
				"actor": "Shigesato Itoi",
				"character": "Tatsuo Kusakabe"
			},
			{
				"actor": "Sumi Shimamoto",
				"character": "Yasuko Kusakabe"
			},
			{
				"actor": "Tanie Kitabayashi",
				"character": "Granny"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Inside Out",
		"description": "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions - Joy, Fear, Anger, Disgust and Sadness - conflict on how best to navigate a new city, house, and school.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Drama",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Amy Poehler",
				"character": "Joy"
			},
			{
				"actor": "Phyllis Smith",
				"character": "Sadness"
			},
			{
				"actor": "Richard Kind",
				"character": "Bing Bong"
			},
			{
				"actor": "Bill Hader",
				"character": "Fear"
			},
			{
				"actor": "Lewis Black",
				"character": "Anger"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Logan",
		"description": "In the near future, a weary Logan cares for an ailing Professor X somewhere on the Mexican border. However, Logan's attempts to hide from the world and his legacy are upended when a young mutant arrives, pursued by dark forces.",
		"genres": [
			"Action",
			"Drama",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Hugh Jackman",
				"character": "Logan"
			},
			{
				"actor": "Patrick Stewart",
				"character": "Charles"
			},
			{
				"actor": "Dafne Keen",
				"character": "Laura"
			},
			{
				"actor": "Boyd Holbrook",
				"character": "Pierce"
			},
			{
				"actor": "Stephen Merchant",
				"character": "Caliban"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Ran",
		"description": "In Medieval Japan, an elderly warlord retires, handing over his empire to his three sons. However, he vastly underestimates how the new-found power will corrupt them and cause them to turn on each other...and him.",
		"genres": [
			"Action",
			"Drama"
		],
		"cast": [
			{
				"actor": "Tatsuya Nakadai",
				"character": "Lord Hidetora Ichimonji"
			},
			{
				"actor": "Akira Terao",
				"character": "Taro Takatora Ichimonji"
			},
			{
				"actor": "Jinpachi Nezu",
				"character": "Jiro Masatora Ichimonji"
			},
			{
				"actor": "Daisuke Ryû",
				"character": "Saburo Naotora Ichimonji"
			},
			{
				"actor": "Mieko Harada",
				"character": "Lady Kaede"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Gold Rush",
		"description": "A prospector goes to the Klondike in search of gold and finds it and more.",
		"genres": [
			"Adventure",
			"Comedy",
			"Drama",
			"Family"
		],
		"cast": [
			{
				"actor": "Charles Chaplin",
				"character": "The Lone Prospector"
			},
			{
				"actor": "Mack Swain",
				"character": "Big Jim McKay"
			},
			{
				"actor": "Tom Murray",
				"character": "Black Larsen"
			},
			{
				"actor": "Henry Bergman",
				"character": "Hank Curtis"
			},
			{
				"actor": "Malcolm Waite",
				"character": "Jack Cameron"
			}
		],
		"rating": 8.2
	},
	{
		"title": "On the Waterfront",
		"description": "An ex-prize fighter turned longshoreman struggles to stand up to his corrupt union bosses.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Marlon Brando",
				"character": "Terry Malloy"
			},
			{
				"actor": "Karl Malden",
				"character": "Father Barry"
			},
			{
				"actor": "Lee J. Cobb",
				"character": "Johnny Friendly"
			},
			{
				"actor": "Rod Steiger",
				"character": "Charley Malloy"
			},
			{
				"actor": "Pat Henning",
				"character": "Kayo Dugan"
			}
		],
		"rating": 8.2
	},
	{
		"title": "El secreto de sus ojos",
		"description": "A retired legal counselor writes a novel hoping to find closure for one of his past unresolved homicide cases and for his unreciprocated love with his superior - both of which still haunt him decades later.",
		"genres": [
			"Drama",
			"Mystery",
			"Romance",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Soledad Villamil",
				"character": "Irene Menéndez Hastings"
			},
			{
				"actor": "Ricardo Darín",
				"character": "Benjamín Esposito"
			},
			{
				"actor": "Carla Quevedo",
				"character": "Liliana Coloto"
			},
			{
				"actor": "Pablo Rago",
				"character": "Ricardo Morales"
			},
			{
				"actor": "Javier Godino",
				"character": "Isidoro Gómez"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Room",
		"description": "A young boy is raised within the confines of a small shed.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Brie Larson",
				"character": "Ma"
			},
			{
				"actor": "Jacob Tremblay",
				"character": "Jack"
			},
			{
				"actor": "Sean Bridgers",
				"character": "Old Nick"
			},
			{
				"actor": "Wendy Crewson",
				"character": "Talk Show Hostess"
			},
			{
				"actor": "Sandy McMaster",
				"character": "Veteran"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Bridge on the River Kwai",
		"description": "After settling his differences with a Japanese PoW camp commander, a British colonel co-operates to oversee his men's construction of a railway bridge for their captors - while oblivious to a plan by the Allies to destroy it.",
		"genres": [
			"Adventure",
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "William Holden",
				"character": "Shears"
			},
			{
				"actor": "Alec Guinness",
				"character": "Colonel Nicholson"
			},
			{
				"actor": "Jack Hawkins",
				"character": "Major Warden"
			},
			{
				"actor": "Sessue Hayakawa",
				"character": "Colonel Saito"
			},
			{
				"actor": "James Donald",
				"character": "Major Clipton"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Blade Runner",
		"description": "A blade runner must pursue and try to terminate four replicants who stole a ship in space and have returned to Earth to find their creator.",
		"genres": [
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Harrison Ford",
				"character": "Rick Deckard"
			},
			{
				"actor": "Rutger Hauer",
				"character": "Roy Batty"
			},
			{
				"actor": "Sean Young",
				"character": "Rachael"
			},
			{
				"actor": "Edward James Olmos",
				"character": "Gaff"
			},
			{
				"actor": "M. Emmet Walsh",
				"character": "Bryant"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Hauru no ugoku shiro",
		"description": "When an unconfident young woman is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard and his companions in his legged, walking castle.",
		"genres": [
			"Animation",
			"Adventure",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Chieko Baishô",
				"character": "Sofî"
			},
			{
				"actor": "Takuya Kimura",
				"character": "Hauru"
			},
			{
				"actor": "Akihiro Miwa",
				"character": "Arechi no Majo"
			},
			{
				"actor": "Tatsuya Gashûin",
				"character": "Karushifâ"
			},
			{
				"actor": "Ryûnosuke Kamiki",
				"character": "Marukuru"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Incendies",
		"description": "Twins journey to the Middle East to discover their family history, and fulfill their mother's last wishes.",
		"genres": [
			"Drama",
			"Mystery",
			"War"
		],
		"cast": [
			{
				"actor": "Mustafa Kamel",
				"character": "Barbier de la Milice / Officer Milice Chrétienne"
			},
			{
				"actor": "Hussein Sami",
				"character": "Nihad"
			},
			{
				"actor": "Rémy Girard",
				"character": "Notaire Jean Lebel"
			},
			{
				"actor": "Mélissa Désormeaux-Poulin",
				"character": "Jeanne Marwan"
			},
			{
				"actor": "Maxim Gaudette",
				"character": "Simon Marwan"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Judgment at Nuremberg",
		"description": "In 1948, an American court in occupied Germany tries four Nazi judges for war crimes.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Spencer Tracy",
				"character": "Chief Judge Dan Haywood"
			},
			{
				"actor": "Burt Lancaster",
				"character": "Dr. Ernst Janning"
			},
			{
				"actor": "Richard Widmark",
				"character": "Col. Tad Lawson"
			},
			{
				"actor": "Marlene Dietrich",
				"character": "Mrs. Bertholt"
			},
			{
				"actor": "Maximilian Schell",
				"character": "Hans Rolfe"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Det sjunde inseglet",
		"description": "A man seeks answers about life, death, and the existence of God as he plays chess against the Grim Reaper during the Black Plague.",
		"genres": [
			"Drama",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Gunnar Björnstrand",
				"character": "squire Jöns"
			},
			{
				"actor": "Bengt Ekerot",
				"character": "Death"
			},
			{
				"actor": "Nils Poppe",
				"character": "Jof / Joseph"
			},
			{
				"actor": "Max von Sydow",
				"character": "Antonius Block"
			},
			{
				"actor": "Bibi Andersson",
				"character": "Mia / Mary - Jof's wife"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Lock, Stock and Two Smoking Barrels",
		"description": "A botched card game in London triggers four friends, thugs, weed-growers, hard gangsters, loan sharks and debt collectors to collide with each other in a series of unexpected events, all for the sake of weed, cash and two antique shotguns.",
		"genres": [
			"Comedy",
			"Crime"
		],
		"cast": [
			{
				"actor": "Jason Flemyng",
				"character": "Tom"
			},
			{
				"actor": "Dexter Fletcher",
				"character": "Soap"
			},
			{
				"actor": "Nick Moran",
				"character": "Eddy"
			},
			{
				"actor": "Jason Statham",
				"character": "Bacon"
			},
			{
				"actor": "Steven Mackintosh",
				"character": "Winston"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Mr. Smith Goes to Washington",
		"description": "A naive man is appointed to fill a vacancy in the United States Senate. His plans promptly collide with political corruption, but he doesn't back down.",
		"genres": [
			"Comedy",
			"Drama"
		],
		"cast": [
			{
				"actor": "Jean Arthur",
				"character": "Saunders"
			},
			{
				"actor": "James Stewart",
				"character": "Jefferson Smith"
			},
			{
				"actor": "Claude Rains",
				"character": "Senator Joseph Paine"
			},
			{
				"actor": "Edward Arnold",
				"character": "Jim Taylor"
			},
			{
				"actor": "Guy Kibbee",
				"character": "Governor Hopper"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Casino",
		"description": "Greed, deception, money, power, and murder occur between two best friends: a mafia underboss and a casino owner, for a trophy wife over a gambling empire.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Robert De Niro",
				"character": "Sam 'Ace' Rothstein"
			},
			{
				"actor": "Sharon Stone",
				"character": "Ginger McKenna"
			},
			{
				"actor": "Joe Pesci",
				"character": "Nicky Santoro"
			},
			{
				"actor": "James Woods",
				"character": "Lester Diamond"
			},
			{
				"actor": "Don Rickles",
				"character": "Billy Sherbert"
			}
		],
		"rating": 8.2
	},
	{
		"title": "A Beautiful Mind",
		"description": "After , a brilliant but asocial mathematician, accepts secret work in cryptography, his life takes a turn for the nightmarish.",
		"genres": [
			"Biography",
			"Drama"
		],
		"cast": [
			{
				"actor": "Russell Crowe",
				"character": "John Nash"
			},
			{
				"actor": "Ed Harris",
				"character": "Parcher"
			},
			{
				"actor": "Jennifer Connelly",
				"character": "Alicia Nash"
			},
			{
				"actor": "Christopher Plummer",
				"character": "Dr. Rosen"
			},
			{
				"actor": "Paul Bettany",
				"character": "Charles"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Andrey Rublev",
		"description": "The life, times and afflictions of the fifteenth-century Russian iconographer.",
		"genres": [
			"Biography",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Anatoliy Solonitsyn",
				"character": "Andrey Rublev"
			},
			{
				"actor": "Ivan Lapikov",
				"character": "Kirill"
			},
			{
				"actor": "Nikolay Grinko",
				"character": "Daniil Chyornyy"
			},
			{
				"actor": "Nikolay Sergeev",
				"character": "Feofan Grek"
			},
			{
				"actor": "Irina Tarkovskaya",
				"character": "Durochka"
			}
		],
		"rating": 8.3
	},
	{
		"title": "The Elephant Man",
		"description": "A Victorian surgeon rescues a heavily disfigured man who is mistreated while scraping a living as a side-show freak. Behind his monstrous facade, there is revealed a person of intelligence and sensitivity.",
		"genres": [
			"Biography",
			"Drama"
		],
		"cast": [
			{
				"actor": "Anthony Hopkins",
				"character": "Frederick Treves"
			},
			{
				"actor": "John Hurt",
				"character": "John Merrick"
			},
			{
				"actor": "Anne Bancroft",
				"character": "Mrs. Kendal"
			},
			{
				"actor": "John Gielgud",
				"character": "Carr Gomm"
			},
			{
				"actor": "Wendy Hiller",
				"character": "Mothershead"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Smultronstället",
		"description": "After living a life marked by coldness, an aging professor is forced to confront the emptiness of his existence.",
		"genres": [
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Victor Sjöström",
				"character": "Dr. Isak Borg"
			},
			{
				"actor": "Bibi Andersson",
				"character": "Sara"
			},
			{
				"actor": "Ingrid Thulin",
				"character": "Marianne Borg"
			},
			{
				"actor": "Gunnar Björnstrand",
				"character": "Dr. Evald Borg"
			},
			{
				"actor": "Jullan Kindahl",
				"character": "Agda"
			}
		],
		"rating": 8.2
	},
	{
		"title": "V for Vendetta",
		"description": "In a future British tyranny, a shadowy freedom fighter, known only by the alias of 'V', plots to overthrow it with the help of a young woman.",
		"genres": [
			"Action",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Natalie Portman",
				"character": "Evey"
			},
			{
				"actor": "Hugo Weaving",
				"character": "V"
			},
			{
				"actor": "Stephen Rea",
				"character": "Finch"
			},
			{
				"actor": "Stephen Fry",
				"character": "Deitrich"
			},
			{
				"actor": "John Hurt",
				"character": "Adam Sutler"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The General",
		"description": "When Union spies steal an engineer's beloved locomotive, he pursues it single-handedly and straight through enemy lines.",
		"genres": [
			"Action",
			"Adventure",
			"Comedy",
			"Drama",
			"War",
			"Western"
		],
		"cast": [
			{
				"actor": "Buster Keaton",
				"character": "Johnnie Gray"
			},
			{
				"actor": "Marion Mack",
				"character": "Annabelle Lee"
			},
			{
				"actor": "Glen Cavender",
				"character": "Captain Anderson"
			},
			{
				"actor": "Jim Farley",
				"character": "General Thatcher"
			},
			{
				"actor": "Frederick Vroom",
				"character": "A Southern General"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Wolf of Wall Street",
		"description": "Based on the true story of , from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.",
		"genres": [
			"Biography",
			"Comedy",
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Leonardo DiCaprio",
				"character": "Jordan Belfort"
			},
			{
				"actor": "Jonah Hill",
				"character": "Donnie Azoff"
			},
			{
				"actor": "Margot Robbie",
				"character": "Naomi Lapaglia"
			},
			{
				"actor": "Matthew McConaughey",
				"character": "Mark Hanna"
			},
			{
				"actor": "Kyle Chandler",
				"character": "Agent Patrick Denham"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Warrior",
		"description": "The youngest son of an alcoholic former boxer returns home, where he's trained by his father for competition in a mixed martial arts tournament - a path that puts the fighter on a collision course with his estranged, older brother.",
		"genres": [
			"Action",
			"Drama",
			"Sport"
		],
		"cast": [
			{
				"actor": "Joel Edgerton",
				"character": "Brendan Conlon"
			},
			{
				"actor": "Tom Hardy",
				"character": "Tommy Conlon"
			},
			{
				"actor": "Nick Nolte",
				"character": "Paddy Conlon"
			},
			{
				"actor": "Jennifer Morrison",
				"character": "Tess Conlon"
			},
			{
				"actor": "Frank Grillo",
				"character": "Frank Campana"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Eskiya",
		"description": "The epic adventures of the legendary Baran the Bandit following his release from prison. After serving 35 years...",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Sener Sen",
				"character": "Baran"
			},
			{
				"actor": "Ugur Yücel",
				"character": "Cumali"
			},
			{
				"actor": "Sermin Hürmeriç",
				"character": "Keje"
			},
			{
				"actor": "Yesim Salkim",
				"character": "Emel"
			},
			{
				"actor": "Kamran Usluer",
				"character": "Berfo"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Trainspotting",
		"description": "Renton, deeply immersed in the Edinburgh drug scene, tries to clean up and get out, despite the allure of the drugs and influence of friends.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Ewan McGregor",
				"character": "Renton"
			},
			{
				"actor": "Ewen Bremner",
				"character": "Spud"
			},
			{
				"actor": "Jonny Lee Miller",
				"character": "Sick Boy"
			},
			{
				"actor": "Kevin McKidd",
				"character": "Tommy"
			},
			{
				"actor": "Robert Carlyle",
				"character": "Begbie"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Sunrise: A Song of Two Humans",
		"description": "An allegorical tale about a man fighting the good and evil within him. Both sides are made flesh - one a sophisticated woman he is attracted to and the other his wife.",
		"genres": [
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "George O'Brien",
				"character": "The Man"
			},
			{
				"actor": "Janet Gaynor",
				"character": "The Wife"
			},
			{
				"actor": "Margaret Livingston",
				"character": "The Woman From the City"
			},
			{
				"actor": "Bodil Rosing",
				"character": "The Maid"
			},
			{
				"actor": "J. Farrell MacDonald",
				"character": "The Photographer"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Dial M for Murder",
		"description": "An ex-tennis pro carries out a plot to murder his wife. When things go wrong, he improvises a brilliant plan B.",
		"genres": [
			"Crime",
			"Film-Noir",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Ray Milland",
				"character": "Tony Wendice"
			},
			{
				"actor": "Grace Kelly",
				"character": "Margot Wendice"
			},
			{
				"actor": "Robert Cummings",
				"character": "Mark Halliday"
			},
			{
				"actor": "John Williams",
				"character": "Chief Inspector Hubbard"
			},
			{
				"actor": "Anthony Dawson",
				"character": "Charles Swann"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Gran Torino",
		"description": "Disgruntled Korean War veteran Walt Kowalski sets out to reform his neighbor, a Hmong teenager who tried to steal Kowalski's prized possession: a 1972 Gran Torino.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Clint Eastwood",
				"character": "Walt Kowalski"
			},
			{
				"actor": "Christopher Carley",
				"character": "Father Janovich"
			},
			{
				"actor": "Bee Vang",
				"character": "Thao"
			},
			{
				"actor": "Ahney Her",
				"character": "Sue"
			},
			{
				"actor": "Brian Haley",
				"character": "Mitch Kowalski"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Hacksaw Ridge",
		"description": "WWII American Army Medic , who served during the Battle of Okinawa, refuses to kill people, and becomes the first man in American history to receive the Medal of Honor without firing a shot.",
		"genres": [
			"Biography",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "Andrew Garfield",
				"character": "Desmond Doss"
			},
			{
				"actor": "Richard Pyros",
				"character": "Teach"
			},
			{
				"actor": "Jacob Warner",
				"character": "James Pinnick"
			},
			{
				"actor": "Milo Gibson",
				"character": "Lucky Ford"
			},
			{
				"actor": "Darcy Bryce",
				"character": "Young Desmond"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Deer Hunter",
		"description": "An in-depth examination of the ways in which the U.S. Vietnam War impacts and disrupts the lives of people in a small industrial town in Pennsylvania.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Robert De Niro",
				"character": "Michael"
			},
			{
				"actor": "John Cazale",
				"character": "Stan"
			},
			{
				"actor": "John Savage",
				"character": "Steven"
			},
			{
				"actor": "Christopher Walken",
				"character": "Nick"
			},
			{
				"actor": "Meryl Streep",
				"character": "Linda"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Gone with the Wind",
		"description": "A manipulative woman and a roguish man conduct a turbulent romance during the American Civil War and Reconstruction periods.",
		"genres": [
			"Drama",
			"History",
			"Romance",
			"War"
		],
		"cast": [
			{
				"actor": "Thomas Mitchell",
				"character": "Gerald O'Hara"
			},
			{
				"actor": "Barbara O'Neil",
				"character": "Ellen - His Wife"
			},
			{
				"actor": "Vivien Leigh",
				"character": "Scarlett - Their Daughter"
			},
			{
				"actor": "Evelyn Keyes",
				"character": "Suellen - Their Daughter"
			},
			{
				"actor": "Ann Rutherford",
				"character": "Carreen - Their Daughter"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Fargo",
		"description": "Jerry Lundegaard's inept crime falls apart due to his and his henchmen's bungling and the persistent police work of the quite pregnant Marge Gunderson.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "William H. Macy",
				"character": "Jerry Lundegaard"
			},
			{
				"actor": "Steve Buscemi",
				"character": "Carl Showalter"
			},
			{
				"actor": "Peter Stormare",
				"character": "Gaear Grimsrud"
			},
			{
				"actor": "Kristin Rudrüd",
				"character": "Jean Lundegaard"
			},
			{
				"actor": "Harve Presnell",
				"character": "Wade Gustafson"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Big Lebowski",
		"description": "'The Dude' Lebowski, mistaken for a millionaire Lebowski, seeks restitution for his ruined rug and enlists his bowling buddies to help get it.",
		"genres": [
			"Comedy",
			"Crime"
		],
		"cast": [
			{
				"actor": "Jeff Bridges",
				"character": "The Dude"
			},
			{
				"actor": "John Goodman",
				"character": "Walter Sobchak"
			},
			{
				"actor": "Julianne Moore",
				"character": "Maude Lebowski"
			},
			{
				"actor": "Steve Buscemi",
				"character": "Theodore Donald 'Donny' Kerabatsos"
			},
			{
				"actor": "David Huddleston",
				"character": "The Big Lebowski"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Sixth Sense",
		"description": "A boy who communicates with spirits that don't know they're dead seeks the help of a disheartened child psychologist.",
		"genres": [
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Bruce Willis",
				"character": "Dr. Malcolm Crowe"
			},
			{
				"actor": "Haley Joel Osment",
				"character": "Cole Sear"
			},
			{
				"actor": "Toni Collette",
				"character": "Lynn Sear"
			},
			{
				"actor": "Olivia Williams",
				"character": "Anna Crowe"
			},
			{
				"actor": "Trevor Morgan",
				"character": "Tommy Tammisimo"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Thing",
		"description": "A research facility in Antarctica comes across an alien force that can become anything it touches with 100% accuracy. The members must now find out who's human and who's not before it's too late.",
		"genres": [
			"Horror",
			"Mystery",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Kurt Russell",
				"character": "R.J. MacReady"
			},
			{
				"actor": "Wilford Brimley",
				"character": "Dr. Blair"
			},
			{
				"actor": "T.K. Carter",
				"character": "Nauls"
			},
			{
				"actor": "David Clennon",
				"character": "Palmer"
			},
			{
				"actor": "Keith David",
				"character": "Childs"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Tôkyô monogatari",
		"description": "An old couple visit their children and grandchildren in the city; but the children have little time for them.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Chishû Ryû",
				"character": "Shukichi Hirayama"
			},
			{
				"actor": "Chieko Higashiyama",
				"character": "Tomi Hirayama"
			},
			{
				"actor": "Setsuko Hara",
				"character": "Noriko Hirayama"
			},
			{
				"actor": "Haruko Sugimura",
				"character": "Shige Kaneko"
			},
			{
				"actor": "Sô Yamamura",
				"character": "Koichi Hirayama"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Finding Nemo",
		"description": "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Family"
		],
		"cast": [
			{
				"actor": "Albert Brooks",
				"character": "Marlin"
			},
			{
				"actor": "Ellen DeGeneres",
				"character": "Dory"
			},
			{
				"actor": "Alexander Gould",
				"character": "Nemo"
			},
			{
				"actor": "Willem Dafoe",
				"character": "Gill"
			},
			{
				"actor": "Brad Garrett",
				"character": "Bloat"
			}
		],
		"rating": 8.1
	},
	{
		"title": "No Country for Old Men",
		"description": "Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.",
		"genres": [
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Tommy Lee Jones",
				"character": "Ed Tom Bell"
			},
			{
				"actor": "Javier Bardem",
				"character": "Anton Chigurh"
			},
			{
				"actor": "Josh Brolin",
				"character": "Llewelyn Moss"
			},
			{
				"actor": "Woody Harrelson",
				"character": "Carson Wells"
			},
			{
				"actor": "Kelly Macdonald",
				"character": "Carla Jean Moss"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Rang De Basanti",
		"description": "This story is about six friends who help an English filmmaker create a documentary about Indian freedom struggle. During filming, this group of friends learn about those before them and the importance of fighting for their rights.",
		"genres": [
			"Comedy",
			"Drama",
			"History",
			"Romance"
		],
		"cast": [
			{
				"actor": "Aamir Khan",
				"character": "Daljeet 'DJ' / Chandrashekhar Azad"
			},
			{
				"actor": "Siddharth",
				"character": "Karan R. Singhania / Bhagat Singh"
			},
			{
				"actor": "Sharman Joshi",
				"character": "Sukhi / Rajguru"
			},
			{
				"actor": "Kunal Kapoor",
				"character": "Aslam / Ashfaqullah Khan"
			},
			{
				"actor": "Atul Kulkarni",
				"character": "Laxman Pandey / Ramprasad Bismil"
			}
		],
		"rating": 8.3
	},
	{
		"title": "La passion de Jeanne d'Arc",
		"description": "A chronicle of the trial of Jeanne d'Arc on charges of heresy, and the efforts of her ecclesiastical jurists to force Jeanne to recant her claims of holy visions.",
		"genres": [
			"Biography",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Maria Falconetti",
				"character": "Jeanne d'Arc"
			},
			{
				"actor": "Eugene Silvain",
				"character": "Évêque Pierre Cauchon"
			},
			{
				"actor": "André Berley",
				"character": "Jean d'Estivet"
			},
			{
				"actor": "Maurice Schutz",
				"character": "Nicolas Loyseleur"
			},
			{
				"actor": "Antonin Artaud",
				"character": "Jean Massieu"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Cool Hand Luke",
		"description": "A man refuses to conform to life in a rural prison.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Paul Newman",
				"character": "Luke"
			},
			{
				"actor": "George Kennedy",
				"character": "Dragline"
			},
			{
				"actor": "J.D. Cannon",
				"character": "Society Red"
			},
			{
				"actor": "Lou Antonio",
				"character": "Koko"
			},
			{
				"actor": "Robert Drivas",
				"character": "Loudmouth Steve"
			}
		],
		"rating": 8.2
	},
	{
		"title": "A Wednesday",
		"description": "A retiring police officer reminisces about the most astounding day of his career. About a case that was never filed but continues to haunt him in his memories - the case of a man and a Wednesday.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Anupam Kher",
				"character": "Prakash Rathod"
			},
			{
				"actor": "Naseeruddin Shah",
				"character": "The Common Man"
			},
			{
				"actor": "Jimmy Shergill",
				"character": "Arif Khan"
			},
			{
				"actor": "Deepal Shaw",
				"character": "Naina Roy"
			},
			{
				"actor": "Aamir Bashir",
				"character": "Jai Singh"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Rebecca",
		"description": "A self-conscious bride is tormented by the memory of her husband's dead first wife.",
		"genres": [
			"Drama",
			"Mystery",
			"Romance",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Laurence Olivier",
				"character": "'Maxim' de Winter"
			},
			{
				"actor": "Joan Fontaine",
				"character": "Mrs. de Winter"
			},
			{
				"actor": "George Sanders",
				"character": "Jack Favell"
			},
			{
				"actor": "Judith Anderson",
				"character": "Mrs. Danvers"
			},
			{
				"actor": "Nigel Bruce",
				"character": "Major Giles Lacy"
			}
		],
		"rating": 8.2
	},
	{
		"title": "How to Train Your Dragon",
		"description": "A hapless young Viking who aspires to hunt dragons becomes the unlikely friend of a young dragon himself, and learns there may be more to the creatures than he assumed.",
		"genres": [
			"Animation",
			"Action",
			"Adventure",
			"Comedy",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Jay Baruchel",
				"character": "Hiccup"
			},
			{
				"actor": "Gerard Butler",
				"character": "Stoick"
			},
			{
				"actor": "Craig Ferguson",
				"character": "Gobber"
			},
			{
				"actor": "America Ferrera",
				"character": "Astrid"
			},
			{
				"actor": "Jonah Hill",
				"character": "Snotlout"
			}
		],
		"rating": 8.1
	},
	{
		"title": "There Will Be Blood",
		"description": "A story of family, religion, hatred, oil and madness, focusing on a turn-of-the-century prospector in the early days of the business.",
		"genres": [
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Daniel Day-Lewis",
				"character": "Daniel Plainview"
			},
			{
				"actor": "Martin Stringer",
				"character": "Silver Assay Worker"
			},
			{
				"actor": "Matthew Braden Stringer",
				"character": "Silver Assay Worker"
			},
			{
				"actor": "Jacob Stringer",
				"character": "Silver Assay Worker"
			},
			{
				"actor": "Joseph Mussey",
				"character": "Silver Assay Worker"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Kill Bill: Vol. 1",
		"description": "The Bride wakens from a four-year coma. The child she carried in her womb is gone. Now she must wreak vengeance on the team of assassins who betrayed her - a team she was once part of.",
		"genres": [
			"Action",
			"Crime",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Uma Thurman",
				"character": "The Bride"
			},
			{
				"actor": "Lucy Liu",
				"character": "O-Ren Ishii"
			},
			{
				"actor": "Vivica A. Fox",
				"character": "Vernita Green"
			},
			{
				"actor": "Daryl Hannah",
				"character": "Elle Driver"
			},
			{
				"actor": "David Carradine",
				"character": "Bill"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Idi i smotri",
		"description": "After finding an old rifle, a young boy joins the Soviet resistance movement against ruthless German forces and experiences the horrors of World War II.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Aleksey Kravchenko",
				"character": "Florya Gaishun"
			},
			{
				"actor": "Olga Mironova",
				"character": "Glasha"
			},
			{
				"actor": "Liubomiras Laucevicius",
				"character": "Kosach"
			},
			{
				"actor": "Vladas Bagdonas as"
			},
			{
				"actor": "Jüri Lumiste",
				"character": "a nazi fanatic German officer"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Mary and Max",
		"description": "A tale of friendship between two unlikely pen pals: Mary, a lonely, eight-year-old girl living in the suburbs of Melbourne, and Max, a forty-four-year old, severely obese man living in New York.",
		"genres": [
			"Animation",
			"Comedy",
			"Drama"
		],
		"cast": [
			{
				"actor": "Toni Collette",
				"character": "Mary Daisy Dinkle"
			},
			{
				"actor": "Philip Seymour Hoffman",
				"character": "Max Jerry Horovitz"
			},
			{
				"actor": "Barry Humphries",
				"character": "Narrator"
			},
			{
				"actor": "Eric Bana",
				"character": "Damien"
			},
			{
				"actor": "Bethany Whitmore",
				"character": "Young Mary Daisy Dinkle"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Gone Girl",
		"description": "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it's suspected that he may not be innocent.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Ben Affleck",
				"character": "Nick Dunne"
			},
			{
				"actor": "Rosamund Pike",
				"character": "Amy Dunne"
			},
			{
				"actor": "Neil Patrick Harris",
				"character": "Desi Collings"
			},
			{
				"actor": "Tyler Perry",
				"character": "Tanner Bolt"
			},
			{
				"actor": "Carrie Coon",
				"character": "Margo Dunne"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Into the Wild",
		"description": "After graduating from Emory University, top student and athlete Christopher McCandless abandons his possessions, gives his entire $24,000 savings account to charity and hitchhikes to Alaska to live in the wilderness. Along the way, Christopher encounters a series of characters that shape his life.",
		"genres": [
			"Adventure",
			"Biography",
			"Drama"
		],
		"cast": [
			{
				"actor": "Emile Hirsch",
				"character": "Chris McCandless"
			},
			{
				"actor": "Marcia Gay Harden",
				"character": "Billie McCandless"
			},
			{
				"actor": "William Hurt",
				"character": "Walt McCandless"
			},
			{
				"actor": "Jena Malone",
				"character": "Carine McCandless / Additional Narrator"
			},
			{
				"actor": "Brian H. Dierker",
				"character": "Rainey"
			}
		],
		"rating": 8.1
	},
	{
		"title": "It Happened One Night",
		"description": "A spoiled heiress running away from her family is helped by a man who is actually a reporter in need of a story.",
		"genres": [
			"Comedy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Clark Gable",
				"character": "Peter"
			},
			{
				"actor": "Claudette Colbert",
				"character": "Ellie"
			},
			{
				"actor": "Walter Connolly",
				"character": "Andrews"
			},
			{
				"actor": "Roscoe Karns",
				"character": "Shapeley"
			},
			{
				"actor": "Jameson Thomas",
				"character": "Westley"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Life of Brian",
		"description": "Brian is born on the original Christmas, in the stable next door. He spends his life being mistaken for a messiah.",
		"genres": [
			"Comedy"
		],
		"cast": [
			{
				"actor": "Graham Chapman",
				"character": "Wise Man #2 / Brian Cohen / Biggus Dickus"
			},
			{
				"actor": "John Cleese",
				"character": "Wise Man #1 / Reg / Jewish Official / First Centurion / Deadly Dirk / Arthur"
			},
			{
				"actor": "Terry Gilliam",
				"character": "Man Even Further Forward / Revolutionary / Jailer / Blood & Thunder Prophet / Frank / Audience Member / Crucifee"
			},
			{
				"actor": "Eric Idle",
				"character": "Mr. Cheeky / Stan aka Loretta / Harry the Haggler / Culprit Woman / Warris / Intensely Dull Youth / Jailer's Assistant / Otto / Lead Singer Crucifee"
			},
			{
				"actor": "Terry Jones",
				"character": "Mandy Cohen / Colin / Simon the Holy Man / Bob Hoskins / Saintly Passer-by / Alarmed Crucifixion Assistant"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Shutter Island",
		"description": "In 1954, a U.S. marshal investigates the disappearance of a murderess who escaped from a hospital for the criminally insane.",
		"genres": [
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Leonardo DiCaprio",
				"character": "Teddy Daniels"
			},
			{
				"actor": "Mark Ruffalo",
				"character": "Chuck Aule"
			},
			{
				"actor": "Ben Kingsley",
				"character": "Dr. Cawley"
			},
			{
				"actor": "Max von Sydow",
				"character": "Dr. Naehring"
			},
			{
				"actor": "Michelle Williams",
				"character": "Dolores"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Platoon",
		"description": "A young recruit in Vietnam faces a moral crisis when confronted with the horrors of war and the duality of man.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Tom Berenger",
				"character": "Sgt. Barnes"
			},
			{
				"actor": "Keith David",
				"character": "King"
			},
			{
				"actor": "Willem Dafoe",
				"character": "Sgt. Elias"
			},
			{
				"actor": "Forest Whitaker",
				"character": "Big Harold"
			},
			{
				"actor": "Francesco Quinn",
				"character": "Rhah"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Hotel Rwanda",
		"description": "Paul Rusesabagina was a hotel manager who housed over a thousand Tutsi refugees during their struggle against the Hutu militia in Rwanda.",
		"genres": [
			"Biography",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "Don Cheadle",
				"character": "Paul Rusesabagina"
			},
			{
				"actor": "Xolani Mali",
				"character": "Policeman"
			},
			{
				"actor": "Desmond Dube",
				"character": "Dube"
			},
			{
				"actor": "Hakeem Kae-Kazim",
				"character": "George Rutaganda"
			},
			{
				"actor": "Tony Kgoroge",
				"character": "Gregoire"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Relatos salvajes",
		"description": "Six short stories that explore the extremities of human behavior involving people in distress.",
		"genres": [
			"Comedy",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Darío Grandinetti",
				"character": "Salgado"
			},
			{
				"actor": "María Marull",
				"character": "Isabel"
			},
			{
				"actor": "Mónica Villa",
				"character": "Profesora Leguizamón"
			},
			{
				"actor": "Rita Cortese",
				"character": "Cocinera"
			},
			{
				"actor": "Julieta Zylberberg",
				"character": "Moza"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Rush",
		"description": "The merciless 1970s rivalry between Formula One rivals  and .",
		"genres": [
			"Action",
			"Biography",
			"Drama",
			"History",
			"Sport"
		],
		"cast": [
			{
				"actor": "Chris Hemsworth",
				"character": "James Hunt"
			},
			{
				"actor": "Daniel Brühl",
				"character": "Niki Lauda"
			},
			{
				"actor": "Olivia Wilde",
				"character": "Suzy Miller"
			},
			{
				"actor": "Alexandra Maria Lara",
				"character": "Marlene Lauda"
			},
			{
				"actor": "Pierfrancesco Favino",
				"character": "Clay Regazzoni"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Le salaire de la peur",
		"description": "In a decrepit South American village, four men are hired to transport an urgent nitroglycerine shipment without the equipment that would make it safe.",
		"genres": [
			"Adventure",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Yves Montand",
				"character": "Mario"
			},
			{
				"actor": "Charles Vanel",
				"character": "M. Jo"
			},
			{
				"actor": "Folco Lulli",
				"character": "Luigi"
			},
			{
				"actor": "Peter van Eyck",
				"character": "Bimba"
			},
			{
				"actor": "Véra Clouzot",
				"character": "Linda"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Network",
		"description": "A television network cynically exploits a deranged former anchor's ravings and revelations about the news media for its own profit.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Faye Dunaway",
				"character": "Diana Christensen"
			},
			{
				"actor": "William Holden",
				"character": "Max Schumacher"
			},
			{
				"actor": "Peter Finch",
				"character": "Howard Beale"
			},
			{
				"actor": "Robert Duvall",
				"character": "Frank Hackett"
			},
			{
				"actor": "Wesley Addy",
				"character": "Nelson Chaney"
			}
		],
		"rating": 8.1
	},
	{
		"title": "In the Name of the Father",
		"description": "A man's coerced confession to an IRA bombing he did not commit results in the imprisonment of his father as well. An English lawyer fights to free them.",
		"genres": [
			"Biography",
			"Drama"
		],
		"cast": [
			{
				"actor": "Alison Crosbie",
				"character": "Girl in Pub"
			},
			{
				"actor": "Daniel Day-Lewis",
				"character": "Gerry Conlon"
			},
			{
				"actor": "Philip King",
				"character": "Guildford Soldier"
			},
			{
				"actor": "Emma Thompson",
				"character": "Gareth Peirce"
			},
			{
				"actor": "Nye Heron",
				"character": "IRA Man 1"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Stand by Me",
		"description": "After the death of a friend, a writer recounts a boyhood journey to find the body of a missing boy.",
		"genres": [
			"Adventure",
			"Drama"
		],
		"cast": [
			{
				"actor": "Wil Wheaton",
				"character": "Gordie Lachance"
			},
			{
				"actor": "River Phoenix",
				"character": "Chris Chambers"
			},
			{
				"actor": "Corey Feldman",
				"character": "Teddy Duchamp"
			},
			{
				"actor": "Jerry O'Connell",
				"character": "Vern Tessio"
			},
			{
				"actor": "Kiefer Sutherland",
				"character": "Ace Merrill"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Les quatre cents coups",
		"description": "Moving story of a young boy who, left without attention, delves into a life of petty crime.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Jean-Pierre Léaud",
				"character": "Antoine Doinel"
			},
			{
				"actor": "Claire Maurier",
				"character": "Gilberte Doinel - la mère d'Antoine"
			},
			{
				"actor": "Albert Rémy",
				"character": "Julien Doinel"
			},
			{
				"actor": "Guy Decomble",
				"character": "the French teacher 'Petite Feuille'"
			},
			{
				"actor": "Georges Flamant",
				"character": "Mr. Bigey"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Spotlight",
		"description": "The true story of how the Boston Globe uncovered the massive scandal of child molestation and cover-up within the local Catholic Archdiocese, shaking the entire Catholic Church to its core.",
		"genres": [
			"Crime",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Mark Ruffalo",
				"character": "Mike Rezendes"
			},
			{
				"actor": "Michael Keaton",
				"character": "Walter 'Robby' Robinson"
			},
			{
				"actor": "Rachel McAdams",
				"character": "Sacha Pfeiffer"
			},
			{
				"actor": "Liev Schreiber",
				"character": "Marty Baron"
			},
			{
				"actor": "John Slattery",
				"character": "Jr. Ben Bradlee"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Mad Max: Fury Road",
		"description": "A woman rebels against a tyrannical ruler in postapocalyptic Australia in search for her home-land with the help of a group of female prisoners, a psychotic worshipper, and a drifter named Max.",
		"genres": [
			"Action",
			"Adventure",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Tom Hardy",
				"character": "Max Rockatansky"
			},
			{
				"actor": "Charlize Theron",
				"character": "Imperator Furiosa"
			},
			{
				"actor": "Nicholas Hoult",
				"character": "Nux"
			},
			{
				"actor": "Hugh Keays-Byrne",
				"character": "Immortan Joe"
			},
			{
				"actor": "Josh Helman",
				"character": "Slit"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Grand Budapest Hotel",
		"description": "The adventures of Gustave H, a legendary concierge at a famous hotel from the fictional Republic of Zubrowka between the first and second World Wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
		"genres": [
			"Adventure",
			"Comedy",
			"Drama"
		],
		"cast": [
			{
				"actor": "Ralph Fiennes",
				"character": "M. Gustave"
			},
			{
				"actor": "F. Murray Abraham",
				"character": "Mr. Moustafa"
			},
			{
				"actor": "Mathieu Amalric",
				"character": "Serge X."
			},
			{
				"actor": "Adrien Brody",
				"character": "Dmitri"
			},
			{
				"actor": "Willem Dafoe",
				"character": "Jopling"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Ben-Hur",
		"description": "When a Jewish prince is betrayed and sent into slavery by a Roman friend, he regains his freedom and comes back for revenge.",
		"genres": [
			"Adventure",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Charlton Heston",
				"character": "Judah Ben-Hur"
			},
			{
				"actor": "Jack Hawkins",
				"character": "Quintus Arrius"
			},
			{
				"actor": "Haya Harareet",
				"character": "Esther"
			},
			{
				"actor": "Stephen Boyd",
				"character": "Messala"
			},
			{
				"actor": "Hugh Griffith",
				"character": "Sheik Ilderim"
			}
		],
		"rating": 8.1
	},
	{
		"title": "12 Years a Slave",
		"description": "In the antebellum United States, , a free black man from upstate New York, is abducted and sold into slavery.",
		"genres": [
			"Biography",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Chiwetel Ejiofor",
				"character": "Solomon Northup"
			},
			{
				"actor": "Dwight Henry",
				"character": "Uncle Abram"
			},
			{
				"actor": "Dickie Gravois",
				"character": "Overseer"
			},
			{
				"actor": "Bryan Batt",
				"character": "Judge Turner"
			},
			{
				"actor": "Ashley Dyke",
				"character": "Anna"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Persona",
		"description": "A nurse is put in charge of a mute actress and finds that their personas are melding together.",
		"genres": [
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Bibi Andersson",
				"character": "Alma"
			},
			{
				"actor": "Liv Ullmann",
				"character": "Elisabet Vogler"
			},
			{
				"actor": "Margaretha Krook",
				"character": "The Doctor"
			},
			{
				"actor": "Gunnar Björnstrand",
				"character": "Mr. Vogler"
			},
			{
				"actor": "Jörgen Lindström",
				"character": "Elisabet's Son"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Million Dollar Baby",
		"description": "A determined woman works with a hardened boxing trainer to become a professional.",
		"genres": [
			"Drama",
			"Sport"
		],
		"cast": [
			{
				"actor": "Clint Eastwood",
				"character": "Frankie Dunn"
			},
			{
				"actor": "Hilary Swank",
				"character": "Maggie Fitzgerald"
			},
			{
				"actor": "Morgan Freeman",
				"character": "Eddie Scrap-Iron Dupris"
			},
			{
				"actor": "Jay Baruchel",
				"character": "Danger Barch"
			},
			{
				"actor": "Mike Colter",
				"character": "Big Willie Little"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Butch Cassidy and the Sundance Kid",
		"description": "Two Western bank/train robbers flee to Bolivia when the law gets too close.",
		"genres": [
			"Biography",
			"Crime",
			"Drama",
			"Western"
		],
		"cast": [
			{
				"actor": "Paul Newman",
				"character": "Butch Cassidy"
			},
			{
				"actor": "Robert Redford",
				"character": "The Sundance Kid"
			},
			{
				"actor": "Katharine Ross",
				"character": "Etta Place"
			},
			{
				"actor": "Strother Martin",
				"character": "Percy Garris"
			},
			{
				"actor": "Henry Jones",
				"character": "Bike Salesman"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Munna Bhai M.B.B.S.",
		"description": "A gangster sets out to fulfill his father's dream of becoming a doctor.",
		"genres": [
			"Comedy",
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Sunil Dutt",
				"character": "Shri Hari Prasad Sharma"
			},
			{
				"actor": "Sanjay Dutt",
				"character": "Murli Prasad 'Munna Bhai' Sharma"
			},
			{
				"actor": "Arshad Warsi",
				"character": "Circuit"
			},
			{
				"actor": "Gracy Singh",
				"character": "Dr. Suman Asthana"
			},
			{
				"actor": "Boman Irani",
				"character": "Dr. J. C. Asthana"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Jurassic Park",
		"description": "During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.",
		"genres": [
			"Adventure",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Sam Neill",
				"character": "Grant"
			},
			{
				"actor": "Laura Dern",
				"character": "Ellie"
			},
			{
				"actor": "Jeff Goldblum",
				"character": "Malcolm"
			},
			{
				"actor": "Richard Attenborough",
				"character": "Hammond"
			},
			{
				"actor": "Bob Peck",
				"character": "Muldoon"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Amores perros",
		"description": "A horrific car accident connects three stories, each involving characters dealing with loss, regret, and life's harsh realities, all in the name of love.",
		"genres": [
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Emilio Echevarría",
				"character": "El Chivo"
			},
			{
				"actor": "Gael García Bernal",
				"character": "Octavio"
			},
			{
				"actor": "Goya Toledo",
				"character": "Valeria"
			},
			{
				"actor": "Álvaro Guerrero",
				"character": "Daniel"
			},
			{
				"actor": "Vanessa Bauche",
				"character": "Susana"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Salinui chueok",
		"description": "In a small Korean province in 1986, three detectives struggle with the case of multiple young women being found raped and murdered by an unknown culprit.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Kang-ho Song",
				"character": "Detective Park Doo-man"
			},
			{
				"actor": "Sang-kyung Kim",
				"character": "Detective Seo Tae-yoon"
			},
			{
				"actor": "Roe-ha Kim",
				"character": "Detective Cho Yong-koo"
			},
			{
				"actor": "Jae-ho Song",
				"character": "Sergeant Shin Dong-chul"
			},
			{
				"actor": "Hee-Bong Byun",
				"character": "Sergeant Koo Hee-bong"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Maltese Falcon",
		"description": "A private detective takes on a case that involves him with three eccentric criminals, a gorgeous liar, and their quest for a priceless statuette.",
		"genres": [
			"Film-Noir",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Humphrey Bogart",
				"character": "Samuel Spade"
			},
			{
				"actor": "Mary Astor",
				"character": "Brigid O'Shaughnessy"
			},
			{
				"actor": "Gladys George",
				"character": "Iva Archer"
			},
			{
				"actor": "Peter Lorre",
				"character": "Joel Cairo"
			},
			{
				"actor": "Barton MacLane",
				"character": "Lt. of Detectives Dundy"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Stalker",
		"description": "A guide leads two men through an area known as the Zone to find a room that grants wishes.",
		"genres": [
			"Drama",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Alisa Freyndlikh",
				"character": "Zhena Stalkera"
			},
			{
				"actor": "Aleksandr Kaydanovskiy",
				"character": "Stalker"
			},
			{
				"actor": "Anatoliy Solonitsyn",
				"character": "Pisatel"
			},
			{
				"actor": "Nikolay Grinko",
				"character": "Professor"
			},
			{
				"actor": "Natalya Abramova",
				"character": "doch Stalkera Marta"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Le notti di Cabiria",
		"description": "A waifish prostitute wanders the streets of Rome looking for true love but finds only heartbreak.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Giulietta Masina",
				"character": "Maria 'Cabiria' Ceccarelli"
			},
			{
				"actor": "François Périer",
				"character": "Oscar D'Onofrio"
			},
			{
				"actor": "Franca Marzi",
				"character": "Wanda"
			},
			{
				"actor": "Dorian Gray",
				"character": "Jessy"
			},
			{
				"actor": "Aldo Silvani",
				"character": "The wizard"
			}
		],
		"rating": 8.2
	},
	{
		"title": "The Princess Bride",
		"description": "While home sick in bed, a young boy's grandfather reads him a story called The Princess Bride.",
		"genres": [
			"Adventure",
			"Family",
			"Fantasy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Cary Elwes",
				"character": "Westley"
			},
			{
				"actor": "Mandy Patinkin",
				"character": "Inigo Montoya"
			},
			{
				"actor": "Chris Sarandon",
				"character": "Prince Humperdinck"
			},
			{
				"actor": "Christopher Guest",
				"character": "Count Rugen"
			},
			{
				"actor": "Wallace Shawn",
				"character": "Vizzini"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Truman Show",
		"description": "An insurance salesman/adjuster discovers his entire life is actually a television show.",
		"genres": [
			"Comedy",
			"Drama",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Jim Carrey",
				"character": "Truman Burbank"
			},
			{
				"actor": "Laura Linney",
				"character": "Meryl Burbank / Hannah Gill"
			},
			{
				"actor": "Noah Emmerich",
				"character": "Marlon"
			},
			{
				"actor": "Natascha McElhone",
				"character": "Lauren / Sylvia"
			},
			{
				"actor": "Holland Taylor",
				"character": "Truman's Mother"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Hachi: A Dog's Tale",
		"description": "A college professor's bond with the abandoned dog he takes into his home.",
		"genres": [
			"Drama",
			"Family"
		],
		"cast": [
			{
				"actor": "Richard Gere",
				"character": "Parker Wilson"
			},
			{
				"actor": "Joan Allen",
				"character": "Cate Wilson"
			},
			{
				"actor": "Cary-Hiroyuki Tagawa",
				"character": "Ken"
			},
			{
				"actor": "Sarah Roemer",
				"character": "Andy"
			},
			{
				"actor": "Jason Alexander",
				"character": "Carl"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Kaze no tani no Naushika",
		"description": "Warrior/pacifist Princess Nausicaä desperately struggles to prevent two warring nations from destroying themselves and their dying planet.",
		"genres": [
			"Animation",
			"Adventure",
			"Fantasy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Sumi Shimamoto",
				"character": "Nausicaä"
			},
			{
				"actor": "Mahito Tsujimura",
				"character": "Jihl / Muzu"
			},
			{
				"actor": "Hisako Kyôda",
				"character": "Oh-Baba"
			},
			{
				"actor": "Gorô Naya",
				"character": "Yupa"
			},
			{
				"actor": "Ichirô Nagai",
				"character": "Mito"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Before Sunrise",
		"description": "A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna. Unfortunately, both know that this will probably be their only night together.",
		"genres": [
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Ethan Hawke",
				"character": "Jesse"
			},
			{
				"actor": "Julie Delpy",
				"character": "Céline"
			},
			{
				"actor": "Andrea Eckert",
				"character": "Wife on Train"
			},
			{
				"actor": "Hanno Pöschl",
				"character": "Husband on Train"
			},
			{
				"actor": "Karl Bruckschwaiger",
				"character": "Guy on Bridge"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Sholay",
		"description": "After his family is murdered by a notorious and ruthless bandit, a former police officer enlists the services of two outlaws to capture the bandit.",
		"genres": [
			"Action",
			"Adventure",
			"Comedy",
			"Drama",
			"Musical",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Dharmendra",
				"character": "Veeru"
			},
			{
				"actor": "Sanjeev Kumar",
				"character": "Thakur Baldev Singh"
			},
			{
				"actor": "Hema Malini",
				"character": "Basanti"
			},
			{
				"actor": "Amitabh Bachchan",
				"character": "Jai"
			},
			{
				"actor": "Jaya Bhaduri",
				"character": "Radha"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Star Wars: Episode VII - The Force Awakens",
		"description": "Three decades after the Empire's defeat, a new threat arises in the militant First Order. Stormtrooper defector Finn and spare parts scavenger Rey are caught up in the Resistance's search for the missing Luke Skywalker.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Harrison Ford",
				"character": "Han Solo"
			},
			{
				"actor": "Mark Hamill",
				"character": "Luke Skywalker"
			},
			{
				"actor": "Carrie Fisher",
				"character": "Princess Leia"
			},
			{
				"actor": "Adam Driver",
				"character": "Kylo Ren"
			},
			{
				"actor": "Daisy Ridley",
				"character": "Rey"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Grapes of Wrath",
		"description": "A poor Midwest family is forced off their land. They travel to California, suffering the misfortunes of the homeless in the Great Depression.",
		"genres": [
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Henry Fonda",
				"character": "Tom Joad"
			},
			{
				"actor": "Jane Darwell",
				"character": "Ma Joad"
			},
			{
				"actor": "John Carradine",
				"character": "Jim Casy"
			},
			{
				"actor": "Charley Grapewin",
				"character": "Grandpa"
			},
			{
				"actor": "Dorris Bowdon",
				"character": "Rosasharn"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Harry Potter and the Deathly Hallows: Part 2",
		"description": "Harry, Ron and Hermione search for Voldemort's remaining Horcruxes in their effort to destroy the Dark Lord as the final battle rages on at Hogwarts.",
		"genres": [
			"Adventure",
			"Drama",
			"Fantasy",
			"Mystery"
		],
		"cast": [
			{
				"actor": "Ralph Fiennes",
				"character": "Lord Voldemort"
			},
			{
				"actor": "Michael Gambon",
				"character": "Professor Albus Dumbledore"
			},
			{
				"actor": "Alan Rickman",
				"character": "Professor Severus Snape"
			},
			{
				"actor": "Daniel Radcliffe",
				"character": "Harry Potter"
			},
			{
				"actor": "Rupert Grint",
				"character": "Ron Weasley"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Rocky",
		"description": "Rocky Balboa, a small-time boxer, gets a supremely rare chance to fight heavy-weight champion Apollo Creed in a bout in which he strives to go the distance for his self-respect.",
		"genres": [
			"Drama",
			"Sport"
		],
		"cast": [
			{
				"actor": "Sylvester Stallone",
				"character": "Rocky"
			},
			{
				"actor": "Talia Shire",
				"character": "Adrian"
			},
			{
				"actor": "Burt Young",
				"character": "Paulie"
			},
			{
				"actor": "Carl Weathers",
				"character": "Apollo"
			},
			{
				"actor": "Burgess Meredith",
				"character": "Mickey"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Touch of Evil",
		"description": "A stark, perverse story of murder, kidnapping, and police corruption in a Mexican border town.",
		"genres": [
			"Crime",
			"Drama",
			"Film-Noir",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Charlton Heston",
				"character": "Mike Vargas"
			},
			{
				"actor": "Janet Leigh",
				"character": "Susan Vargas"
			},
			{
				"actor": "Orson Welles",
				"character": "Police Captain Hank Quinlan"
			},
			{
				"actor": "Joseph Calleia",
				"character": "Police Sergeant Pete Menzies"
			},
			{
				"actor": "Akim Tamiroff",
				"character": "'Uncle' Joe Grandi"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Hera Pheri",
		"description": "Three unemployed men find the answer to all their money problems when they recieve a call from a kidnapper. However, things do not go as planned.",
		"genres": [
			"Comedy",
			"Crime",
			"Musical",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Akshay Kumar",
				"character": "Raju"
			},
			{
				"actor": "Paresh Rawal",
				"character": "Baburao Ganpatrao Apte"
			},
			{
				"actor": "Sunil Shetty",
				"character": "Ghanshyam"
			},
			{
				"actor": "Tabu",
				"character": "Anuradha Shivshankar Panikar"
			},
			{
				"actor": "Om Puri",
				"character": "Kharak Singh"
			}
		],
		"rating": 8.3
	},
	{
		"title": "Prisoners",
		"description": "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Hugh Jackman",
				"character": "Keller Dover"
			},
			{
				"actor": "Jake Gyllenhaal",
				"character": "Detective Loki"
			},
			{
				"actor": "Viola Davis",
				"character": "Nancy Birch"
			},
			{
				"actor": "Maria Bello",
				"character": "Grace Dover"
			},
			{
				"actor": "Terrence Howard",
				"character": "Franklin Birch"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Gandhi",
		"description": "Gandhi's character is fully explained as a man of nonviolence. Through his patience, he is able to drive the British out of the subcontinent. And the stubborn nature of Jinnah and his commitment towards Pakistan is portrayed.",
		"genres": [
			"Biography",
			"Drama",
			"History"
		],
		"cast": [
			{
				"actor": "Ben Kingsley",
				"character": "Mahatma Gandhi"
			},
			{
				"actor": "Candice Bergen",
				"character": "Margaret Bourke-White"
			},
			{
				"actor": "Edward Fox",
				"character": "General Dyer"
			},
			{
				"actor": "John Gielgud",
				"character": "Lord Irwin"
			},
			{
				"actor": "Trevor Howard",
				"character": "Judge Broomfield"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Les diaboliques",
		"description": "The wife and mistress of a cruel headmaster conspire to kill him; after the murder is committed, his corpse disappears, and strange events begin to plague the two women.",
		"genres": [
			"Crime",
			"Drama",
			"Horror",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Simone Signoret",
				"character": "Nicole Horner"
			},
			{
				"actor": "Véra Clouzot",
				"character": "Christina Delassalle"
			},
			{
				"actor": "Paul Meurisse",
				"character": "Michel Delassalle"
			},
			{
				"actor": "Charles Vanel",
				"character": "le commissaire Alfred Fichet"
			},
			{
				"actor": "Jean Brochard",
				"character": "le concierge Plantiveau"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Annie Hall",
		"description": "Neurotic New York comedian Alvy Singer falls in love with the ditzy Annie Hall.",
		"genres": [
			"Comedy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Woody Allen",
				"character": "Alvy Singer"
			},
			{
				"actor": "Diane Keaton",
				"character": "Annie Hall"
			},
			{
				"actor": "Tony Roberts",
				"character": "Rob"
			},
			{
				"actor": "Carol Kane",
				"character": "Allison"
			},
			{
				"actor": "Paul Simon",
				"character": "Tony Lacey"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Donnie Darko",
		"description": "A troubled teenager is plagued by visions of a man in a large rabbit suit who manipulates him to commit a series of crimes, after he narrowly escapes a bizarre accident.",
		"genres": [
			"Drama",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Jake Gyllenhaal",
				"character": "Donnie Darko"
			},
			{
				"actor": "Holmes Osborne",
				"character": "Eddie Darko"
			},
			{
				"actor": "Maggie Gyllenhaal",
				"character": "Elizabeth Darko"
			},
			{
				"actor": "Daveigh Chase",
				"character": "Samantha Darko"
			},
			{
				"actor": "Mary McDonnell",
				"character": "Rose Darko"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Catch Me If You Can",
		"description": "The story of 'Frank Abagnale Jr., before his 19th birthday, successfully forged millions of dollars' worth of checks while posing as a Pan Am pilot, a doctor, and legal prosecutor as a seasoned and dedicated FBI agent pursues him.",
		"genres": [
			"Biography",
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Leonardo DiCaprio",
				"character": "Frank Abagnale Jr."
			},
			{
				"actor": "Tom Hanks",
				"character": "Carl Hanratty"
			},
			{
				"actor": "Christopher Walken",
				"character": "Frank Abagnale"
			},
			{
				"actor": "Martin Sheen",
				"character": "Roger Strong"
			},
			{
				"actor": "Nathalie Baye",
				"character": "Paula Abagnale"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Monsters, Inc.",
		"description": "In order to power the city, monsters have to scare children so that they scream. However, the children are toxic to the monsters, and after a child gets through, 2 monsters realize things may not be what they think.",
		"genres": [
			"Animation",
			"Adventure",
			"Comedy",
			"Family",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "John Goodman",
				"character": "Sullivan"
			},
			{
				"actor": "Billy Crystal",
				"character": "Mike"
			},
			{
				"actor": "Mary Gibbs",
				"character": "Boo"
			},
			{
				"actor": "Steve Buscemi",
				"character": "Randall"
			},
			{
				"actor": "James Coburn",
				"character": "Waternoose"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Bourne Ultimatum",
		"description": "Jason Bourne dodges a ruthless CIA official and his agents from a new assassination program while searching for the origins of his life as a trained killer.",
		"genres": [
			"Action",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Matt Damon",
				"character": "Jason Bourne"
			},
			{
				"actor": "Julia Stiles",
				"character": "Nicky Parsons"
			},
			{
				"actor": "David Strathairn",
				"character": "Noah Vosen"
			},
			{
				"actor": "Scott Glenn",
				"character": "Ezra Kramer"
			},
			{
				"actor": "Paddy Considine",
				"character": "Simon Ross"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Terminator",
		"description": "A seemingly indestructible humanoid cyborg is sent from 2029 to 1984 to assassinate a waitress, whose unborn son will lead humanity in a war against the machines, while a soldier from that war is sent to protect her at all costs.",
		"genres": [
			"Action",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Arnold Schwarzenegger",
				"character": "Terminator"
			},
			{
				"actor": "Michael Biehn",
				"character": "Kyle Reese"
			},
			{
				"actor": "Linda Hamilton",
				"character": "Sarah Connor"
			},
			{
				"actor": "Paul Winfield",
				"character": "Lieutenant Ed Traxler"
			},
			{
				"actor": "Lance Henriksen",
				"character": "Detective Hal Vukovich"
			}
		],
		"rating": 8
	},
	{
		"title": "8½",
		"description": "A harried movie director retreats into his memories and fantasies.",
		"genres": [
			"Drama",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Marcello Mastroianni",
				"character": "Guido Anselmi"
			},
			{
				"actor": "Claudia Cardinale",
				"character": "Claudia"
			},
			{
				"actor": "Anouk Aimée",
				"character": "Luisa Anselmi"
			},
			{
				"actor": "Sandra Milo",
				"character": "Carla"
			},
			{
				"actor": "Rossella Falk",
				"character": "Rossella"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Wizard of Oz",
		"description": "Dorothy Gale is swept away from a farm in Kansas to a magical land of Oz in a tornado and embarks on a quest with her new friends to see the Wizard who can help her return home in Kansas and help her friends as well.",
		"genres": [
			"Adventure",
			"Family",
			"Fantasy",
			"Musical"
		],
		"cast": [
			{
				"actor": "Judy Garland",
				"character": "Dorothy"
			},
			{
				"actor": "Frank Morgan",
				"character": "Professor Marvel / The Wizard of Oz / The Gatekeeper / The Carriage Driver / The Guard"
			},
			{
				"actor": "Ray Bolger",
				"character": "'Hunk' / The Scarecrow"
			},
			{
				"actor": "Bert Lahr",
				"character": "'Zeke' / The Cowardly Lion"
			},
			{
				"actor": "Jack Haley",
				"character": "'Hickory' / The Tin Man"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Groundhog Day",
		"description": "A weatherman finds himself inexplicably living the same day over and over again.",
		"genres": [
			"Comedy",
			"Fantasy",
			"Romance"
		],
		"cast": [
			{
				"actor": "Bill Murray",
				"character": "Phil"
			},
			{
				"actor": "Andie MacDowell",
				"character": "Rita"
			},
			{
				"actor": "Chris Elliott",
				"character": "Larry"
			},
			{
				"actor": "Stephen Tobolowsky",
				"character": "Ned"
			},
			{
				"actor": "Brian Doyle-Murray",
				"character": "Buster"
			}
		],
		"rating": 8
	},
	{
		"title": "Barry Lyndon",
		"description": "An Irish rogue wins the heart of a rich widow and assumes her dead husband's aristocratic position in 18th-century England.",
		"genres": [
			"Adventure",
			"Drama",
			"History",
			"War"
		],
		"cast": [
			{
				"actor": "Ryan O'Neal",
				"character": "Barry Lyndon"
			},
			{
				"actor": "Marisa Berenson",
				"character": "Lady Honoria Lyndon"
			},
			{
				"actor": "Patrick Magee",
				"character": "The Chevalier du Balibari"
			},
			{
				"actor": "Hardy Krüger",
				"character": "Capt. Potzdorf"
			},
			{
				"actor": "Steven Berkoff",
				"character": "Lord Ludd"
			}
		],
		"rating": 8.1
	},
	{
		"title": "La haine",
		"description": "24 hours in the lives of three young men in the French suburbs the day after a violent riot.",
		"genres": [
			"Crime",
			"Drama"
		],
		"cast": [
			{
				"actor": "Vincent Cassel",
				"character": "Vinz"
			},
			{
				"actor": "Hubert Koundé",
				"character": "Hubert"
			},
			{
				"actor": "Saïd Taghmaoui",
				"character": "Saïd"
			},
			{
				"actor": "Abdel Ahmed Ghili",
				"character": "Abdel"
			},
			{
				"actor": "Solo",
				"character": "Santo"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Twelve Monkeys",
		"description": "In a future world devastated by disease, a convict is sent back in time to gather information about the man-made virus that wiped out most of the human population on the planet.",
		"genres": [
			"Mystery",
			"Sci-Fi",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Joseph Melito",
				"character": "Young Cole"
			},
			{
				"actor": "Bruce Willis",
				"character": "James Cole"
			},
			{
				"actor": "Jon Seda",
				"character": "Jose"
			},
			{
				"actor": "Michael Chance",
				"character": "Scarface"
			},
			{
				"actor": "Vernon Campbell",
				"character": "Tiny"
			}
		],
		"rating": 8
	},
	{
		"title": "Jaws",
		"description": "A giant great white shark arrives on the shores of a New England beach resort and wreaks havoc with bloody attacks on swimmers, until a local sheriff teams up with a marine biologist and an old seafarer to hunt the monster down.",
		"genres": [
			"Adventure",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Roy Scheider",
				"character": "Chief Martin Brody"
			},
			{
				"actor": "Robert Shaw",
				"character": "Quint"
			},
			{
				"actor": "Richard Dreyfuss",
				"character": "Matt Hooper"
			},
			{
				"actor": "Lorraine Gary",
				"character": "Ellen Brody"
			},
			{
				"actor": "Murray Hamilton",
				"character": "Mayor Larry Vaughn"
			}
		],
		"rating": 8
	},
	{
		"title": "Mou gaan dou",
		"description": "A story between a mole in the police department and an undercover cop. Their objectives are the same: to find out who is the mole, and who is the cop.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Andy Lau",
				"character": "Inspector Lau Kin Ming"
			},
			{
				"actor": "Tony Chiu-Wai Leung",
				"character": "Chen Wing Yan"
			},
			{
				"actor": "Anthony Chau-Sang Wong",
				"character": "SP Wong Chi Shing"
			},
			{
				"actor": "Eric Tsang",
				"character": "Hon Sam"
			},
			{
				"actor": "Kelly Chen",
				"character": "Dr. Lee Sum Yee"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Best Years of Our Lives",
		"description": "Three World War II veterans return home to small-town America to discover that they and their families have been irreparably changed.",
		"genres": [
			"Drama",
			"Romance",
			"War"
		],
		"cast": [
			{
				"actor": "Myrna Loy",
				"character": "Milly Stephenson"
			},
			{
				"actor": "Fredric March",
				"character": "Al Stephenson"
			},
			{
				"actor": "Dana Andrews",
				"character": "Fred Derry"
			},
			{
				"actor": "Teresa Wright",
				"character": "Peggy Stephenson"
			},
			{
				"actor": "Virginia Mayo",
				"character": "Marie Derry"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Gangs of Wasseypur",
		"description": "A clash between Sultan and Shahid Khan leads to the expulsion of Khan from Wasseypur, and ignites a deadly blood feud spanning three generations.",
		"genres": [
			"Action",
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Manoj Bajpayee",
				"character": "Sardar Khan"
			},
			{
				"actor": "Richa Chadha",
				"character": "Nagma Khatoon"
			},
			{
				"actor": "Nawazuddin Siddiqui",
				"character": "Faizal Khan"
			},
			{
				"actor": "Tigmanshu Dhulia",
				"character": "Ramadhir Singh"
			},
			{
				"actor": "Jameel Khan",
				"character": "Asgar Khan"
			}
		],
		"rating": 8.3
	},
	{
		"title": "La battaglia di Algeri",
		"description": "In the 1950s, fear and violence escalate as the people of Algiers fight for independence from the French government.",
		"genres": [
			"Drama",
			"War"
		],
		"cast": [
			{
				"actor": "Jean Martin",
				"character": "Col. Mathieu"
			},
			{
				"actor": "Yacef Saadi",
				"character": "Djafar"
			},
			{
				"actor": "Brahim Hadjadj",
				"character": "Ali La Pointe"
			},
			{
				"actor": "Samia Kerbash",
				"character": "One of the girls"
			},
			{
				"actor": "Tommaso Neri",
				"character": "Captain"
			}
		],
		"rating": 8.1
	},
	{
		"title": "The Help",
		"description": "An aspiring author during the civil rights movement of the 1960s decides to write a book detailing the African American maids point of view on the white families for which they work, and the hardships they go through on a daily basis.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Emma Stone",
				"character": "Skeeter Phelan"
			},
			{
				"actor": "Viola Davis",
				"character": "Aibileen Clark"
			},
			{
				"actor": "Bryce Dallas Howard",
				"character": "Hilly Holbrook"
			},
			{
				"actor": "Octavia Spencer",
				"character": "Minny Jackson"
			},
			{
				"actor": "Jessica Chastain",
				"character": "Celia Foote"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Dog Day Afternoon",
		"description": "A man robs a bank to pay for his lover's operation; it turns into a hostage situation and a media circus.",
		"genres": [
			"Biography",
			"Crime",
			"Drama",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Penelope Allen",
				"character": "Sylvia"
			},
			{
				"actor": "Sully Boyar",
				"character": "Mulvaney"
			},
			{
				"actor": "John Cazale",
				"character": "Sal"
			},
			{
				"actor": "Beulah Garrick",
				"character": "Margaret"
			},
			{
				"actor": "Carol Kane",
				"character": "Jenny"
			}
		],
		"rating": 8
	},
	{
		"title": "Beauty and the Beast",
		"description": "A young woman whose father has been imprisoned by a terrifying beast offers herself in his place, unaware that her captor is actually a prince, physically altered by a magic spell.",
		"genres": [
			"Animation",
			"Family",
			"Fantasy",
			"Musical",
			"Romance"
		],
		"cast": [
			{
				"actor": "Robby Benson",
				"character": "Beast"
			},
			{
				"actor": "Jesse Corti",
				"character": "Lefou"
			},
			{
				"actor": "Rex Everhart",
				"character": "Maurice"
			},
			{
				"actor": "Angela Lansbury",
				"character": "Mrs. Potts"
			},
			{
				"actor": "Paige O'Hara",
				"character": "Belle"
			}
		],
		"rating": 8
	},
	{
		"title": "What Ever Happened to Baby Jane?",
		"description": "A former child star torments her paraplegic sister in their decaying Hollywood mansion.",
		"genres": [
			"Drama",
			"Horror",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Bette Davis",
				"character": "Baby Jane Hudson"
			},
			{
				"actor": "Joan Crawford",
				"character": "Blanche Hudson"
			},
			{
				"actor": "Victor Buono",
				"character": "Edwin Flagg"
			},
			{
				"actor": "Wesley Addy",
				"character": "Marty Mc Donald"
			},
			{
				"actor": "Julie Allred",
				"character": "in 1917 Baby Jane Hudson"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Faa yeung nin wa",
		"description": "Two neighbors, a woman and a man, form a strong bond after both suspect extramarital activities of their spouses. However, they agree to keep their bond platonic so as not to commit similar wrongs.",
		"genres": [
			"Drama",
			"Romance"
		],
		"cast": [
			{
				"actor": "Maggie Cheung",
				"character": "Su Li-zhen - Mrs. Chan"
			},
			{
				"actor": "Tony Chiu-Wai Leung",
				"character": "Chow Mo-wan"
			},
			{
				"actor": "Ping Lam Siu",
				"character": "Ah Ping"
			},
			{
				"actor": "Tung Cho 'Joe' Cheung",
				"character": "Man living in Mr. Koo's apartment"
			},
			{
				"actor": "Rebecca Pan",
				"character": "Mrs. Suen"
			}
		],
		"rating": 8.1
	},
	{
		"title": "Pirates of the Caribbean: The Curse of the Black Pearl",
		"description": "Blacksmith Will Turner teams up with eccentric pirate \"Captain\" Jack Sparrow to save his love, the governor's daughter, from Jack's former pirate allies, who are now undead.",
		"genres": [
			"Action",
			"Adventure",
			"Fantasy"
		],
		"cast": [
			{
				"actor": "Johnny Depp",
				"character": "Jack Sparrow"
			},
			{
				"actor": "Geoffrey Rush",
				"character": "Barbossa"
			},
			{
				"actor": "Orlando Bloom",
				"character": "Will Turner"
			},
			{
				"actor": "Keira Knightley",
				"character": "Elizabeth Swann"
			},
			{
				"actor": "Jack Davenport",
				"character": "Norrington"
			}
		],
		"rating": 8
	},
	{
		"title": "Paris, Texas",
		"description": "Travis Henderson, an aimless drifter who has been missing for four years, wanders out of the desert and must reconnect with society, himself, his life, and his family.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Harry Dean Stanton",
				"character": "Travis Henderson"
			},
			{
				"actor": "Sam Berry",
				"character": "Gas Station Attendant"
			},
			{
				"actor": "Bernhard Wicki",
				"character": "Doctor Ulmer"
			},
			{
				"actor": "Dean Stockwell",
				"character": "Walt Henderson"
			},
			{
				"actor": "Aurore Clément",
				"character": "Anne Henderson"
			}
		],
		"rating": 8.1
	},
	{
		"title": "PK",
		"description": "A stranger in the city asks questions no one has asked before. His childlike curiosity will take him on a journey of love, laughter, and letting go.",
		"genres": [
			"Comedy",
			"Drama",
			"Fantasy",
			"Romance",
			"Sci-Fi"
		],
		"cast": [
			{
				"actor": "Aamir Khan",
				"character": "P.K."
			},
			{
				"actor": "Anushka Sharma",
				"character": "Jagat Janani / Jaggu"
			},
			{
				"actor": "Sanjay Dutt",
				"character": "Bhairon Singh"
			},
			{
				"actor": "Boman Irani",
				"character": "Cherry Bajwa"
			},
			{
				"actor": "Saurabh Shukla",
				"character": "Tapasvi Maharaj"
			}
		],
		"rating": 8.2
	},
	{
		"title": "Drishyam",
		"description": "Desperate measures are taken by a man who tries to save his family from the dark side of the law, after they commit an unexpected crime.",
		"genres": [
			"Crime",
			"Drama",
			"Mystery",
			"Thriller"
		],
		"cast": [
			{
				"actor": "Ajay Devgn",
				"character": "Vijay Salgaonkar"
			},
			{
				"actor": "Shriya Saran",
				"character": "Nandini Salgaonkar"
			},
			{
				"actor": "Tabu",
				"character": "Meera Deshmukh"
			},
			{
				"actor": "Rajat Kapoor",
				"character": "Mahesh Deshmukh"
			},
			{
				"actor": "Ishita Dutta",
				"character": "Anju Salgaonkar"
			}
		],
		"rating": 8.4
	},
	{
		"title": "Swades: We, the People",
		"description": "A successful Indian scientist returns to an Indian village to take his nanny to America with him and in the process rediscovers his roots.",
		"genres": [
			"Drama"
		],
		"cast": [
			{
				"actor": "Shah Rukh Khan",
				"character": "Mohan Bhargava"
			},
			{
				"actor": "Gayatri Joshi",
				"character": "Gita"
			},
			{
				"actor": "Kishori Balal",
				"character": "Kaveri amma"
			},
			{
				"actor": "Smit Sheth",
				"character": "Chiku"
			},
			{
				"actor": "Lekh Tandon",
				"character": "Dadaji - Freedom Fighter"
			}
		],
		"rating": 8.3
	}
]

let movienr = 0;

for(let item of movies) {
    item.genres = item.genres.map((v)=>{
        let key = v.toLowerCase();
        if(!genres[key]) console.log('category not found',key);
        return genres[key];
    });
    for(let cat of item.genres){
        cat.movies.push(item);
    }
	item.ref = item.title.toLowerCase();
    item.movies = [];
    item.id = movienr++;
};

genres.top = genres.slice().sort((a,b)=> b.movies.length - a.movies.length).slice(0,5);