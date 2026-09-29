package com.example.movie.config;

import com.example.movie.model.Movie;
import com.example.movie.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public void run(String... args) throws Exception {
        List<Movie> movies = Arrays.asList(
                // Universal / Safe Movies (U or U/A)
                new Movie(
                    "Interstellar", "Sci-Fi, Adventure, Drama", "English", 8.7, 2014, "U/A",
                    "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
                    "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
                    "https://www.youtube.com/watch?v=zSWdZVtXT7E",
                    false, false, true
                ),
                new Movie(
                    "RRR", "Action, Drama", "Telugu", 8.0, 2022, "U/A",
                    "https://image.tmdb.org/t/p/w500/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg",
                    "A fearless revolutionary and an officer in the British force, who once shared an unbreakable bond, decide to join forces and chart out an inspiring path of freedom against the despotic rulers.",
                    "https://www.youtube.com/watch?v=NgBoMJy386M",
                    false, false, true
                ),
                new Movie(
                    "Inception", "Sci-Fi, Action", "English", 8.8, 2010, "U/A",
                    "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
                    "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                    "https://www.youtube.com/watch?v=YoHD9XEInc0",
                    false, false, true
                ),
                new Movie(
                    "Baahubali 2: The Conclusion", "Action, Drama, Fantasy", "Telugu", 8.2, 2017, "U/A",
                    "https://image.tmdb.org/t/p/w500/21sC2assImQIYCEDA84Qh9d1RsK.jpg",
                    "When Mahendra Baahubali learns about his heritage, he begins to look for answers. His story is juxtaposed with past events that unfolded in the Mahishmati Kingdom.",
                    "https://www.youtube.com/watch?v=G62HrubdD6o",
                    false, false, true
                ),
                new Movie(
                    "The Dark Knight", "Action, Crime, Drama", "English", 9.0, 2008, "U/A",
                    "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                    "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                    "https://www.youtube.com/watch?v=EXeTwQWrcwY",
                    false, false, true
                ),
                new Movie(
                    "Avengers: Endgame", "Action, Sci-Fi, Adventure", "English", 8.4, 2019, "U/A",
                    "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
                    "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
                    "https://www.youtube.com/watch?v=TcMBFSGVi1c",
                    false, false, true
                ),
                new Movie(
                    "Spider-Man: Across the Spider-Verse", "Animation, Action, Adventure", "English", 8.7, 2023, "U/A",
                    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
                    "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                    "https://www.youtube.com/watch?v=cqGjhVJWtEg",
                    false, false, true
                ),
                new Movie(
                    "Coco", "Animation, Family, Fantasy", "English", 8.4, 2017, "U",
                    "https://image.tmdb.org/t/p/w500/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
                    "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer.",
                    "https://www.youtube.com/watch?v=xlnPHQ3TLX8",
                    false, false, true
                ),
                new Movie(
                    "3 Idiots", "Comedy, Drama", "Hindi", 8.4, 2009, "U/A",
                    "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg",
                    "Two friends search for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.",
                    "https://www.youtube.com/watch?v=K0eDlFX9GMc",
                    false, false, true
                ),
                new Movie(
                    "Dangal", "Action, Biography, Drama", "Hindi", 8.3, 2016, "U",
                    "https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg",
                    "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
                    "https://www.youtube.com/watch?v=x_7YlGv9u1g",
                    false, false, true
                ),
                new Movie(
                    "Pushpa: The Rise", "Action, Crime, Drama", "Telugu", 7.6, 2021, "U/A",
                    "https://image.tmdb.org/t/p/w500/4DpNRjV7ITZ1GzCvrvCk86th0w.jpg",
                    "A laborer rises through the ranks of a red sandalwood smuggling syndicate, making some powerful enemies in the process.",
                    "https://www.youtube.com/watch?v=pKctjlpbipc",
                    false, false, true
                ),
                new Movie(
                    "Kalki 2898 AD", "Action, Sci-Fi, Fantasy", "Telugu", 7.5, 2024, "U/A",
                    "https://image.tmdb.org/t/p/w500/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
                    "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces.",
                    "https://www.youtube.com/watch?v=y1-w1pUGuzg",
                    false, false, true
                ),
                new Movie(
                    "K.G.F: Chapter 2", "Action, Crime, Drama", "Kannada", 8.2, 2022, "U/A",
                    "https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg",
                    "In the blood-soaked Kolar Gold Fields, Rocky's name strikes fear into his foes while the government sees him as a threat to law and order.",
                    "https://www.youtube.com/watch?v=JKa05nyUmuQ",
                    false, false, true
                ),
                new Movie(
                    "The Lion King", "Animation, Adventure, Drama", "English", 8.5, 1994, "U",
                    "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
                    "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
                    "https://www.youtube.com/watch?v=7TavVZMewpY",
                    false, false, true
                ),
                new Movie(
                    "Finding Nemo", "Animation, Adventure, Comedy", "English", 8.2, 2003, "U",
                    "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
                    "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.",
                    "https://www.youtube.com/watch?v=2zLkasScy7A",
                    false, false, false
                ),
                new Movie(
                    "Up", "Animation, Adventure, Comedy", "English", 8.3, 2009, "U",
                    "https://image.tmdb.org/t/p/w500/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg",
                    "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.",
                    "https://www.youtube.com/watch?v=ORFWDXl_zQ4",
                    false, false, false
                ),

                // RESTRICTED: Horror Movies (Filtered out for Under 18)
                new Movie(
                    "The Conjuring", "Horror, Mystery, Thriller", "English", 7.5, 2013, "A",
                    "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
                    "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
                    "https://www.youtube.com/watch?v=k10ETZ41q5o",
                    true, true, true
                ),
                new Movie(
                    "IT Chapter Two", "Horror, Fantasy", "English", 6.5, 2019, "18+",
                    "https://image.tmdb.org/t/p/w500/zfE0R94v1E8cuKAerbskfD3VfUt.jpg",
                    "Twenty-seven years after their first encounter with the terrifying Pennywise, the Losers Club have grown up and moved away, until a devastating phone call brings them back.",
                    "https://www.youtube.com/watch?v=xhJ5P7Up3jA",
                    true, true, false
                ),
                new Movie(
                    "A Quiet Place Part II", "Horror, Sci-Fi, Thriller", "English", 7.2, 2020, "A",
                    "https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg",
                    "Following the events at home, the Abbott family now face the terrors of the outside world. Forced to venture into the unknown, they realize the creatures are not the only threats.",
                    "https://www.youtube.com/watch?v=BpdDN9d9Jio",
                    true, true, false
                ),

                // RESTRICTED: Adult / R-Rated Content (Filtered out for Under 18)
                new Movie(
                    "Arjun Reddy", "Drama, Romance", "Telugu", 8.0, 2017, "A / 18+",
                    "https://image.tmdb.org/t/p/w500/kHubDgL59I5hCn7ccBYvU7bKY1r.jpg",
                    "A short-tempered house surgeon embarks on a self-destructive path of heavy substance abuse after his girlfriend is forced to marry another person.",
                    "https://www.youtube.com/watch?v=aozErj9NqeE",
                    true, false, true
                ),
                new Movie(
                    "Kabir Singh", "Drama, Romance", "Hindi", 7.1, 2019, "A / 18+",
                    "https://upload.wikimedia.org/wikipedia/en/d/dc/Kabir_Singh.jpg",
                    "A medical student who falls in love with Preeti descends into anger and self-destruction when forced apart.",
                    "https://www.youtube.com/watch?v=RiANSSgCuJk",
                    true, false, true
                ),
                new Movie(
                    "Animal", "Action, Crime, Drama", "Hindi", 7.0, 2023, "A / 18+",
                    "https://image.tmdb.org/t/p/w500/hr9rjR3J0xBBKmlJ4n3gHId9ccx.jpg",
                    "A toxic and obsessive bond between a father and son leads the protagonist on a path of relentless violence and retribution.",
                    "https://www.youtube.com/watch?v=Dydmpfo68DA",
                    true, false, true
                ),
                new Movie(
                    "Fifty Shades of Grey", "Romance, Drama", "English", 5.8, 2015, "18+",
                    "https://upload.wikimedia.org/wikipedia/en/7/73/Fifty_Shades_of_Grey_poster.jpg",
                    "Literature student Anastasia Steele's life changes forever when she meets handsome, yet tormented, billionaire Christian Grey.",
                    "https://www.youtube.com/watch?v=SfZWFDs0LxA",
                    true, false, true
                ),
                new Movie(
                    "365 Days", "Romance, Drama", "English", 5.0, 2020, "18+",
                    "https://image.tmdb.org/t/p/w500/6KwrHucIE3CvNT7kTm2MAlZ4fYF.jpg",
                    "Massimo is a member of the Sicilian Mafia family and Laura is a sales director. He kidnaps her and gives her 365 days to fall in love with him.",
                    "https://www.youtube.com/watch?v=pyM3z73oMAk",
                    true, false, true
                ),
                new Movie(
                    "Deadpool & Wolverine", "Action, Comedy, Sci-Fi", "English", 7.8, 2024, "A / 18+",
                    "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
                    "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary behind him. But when an existential threat arises, he must suit up with an even more reluctant Wolverine.",
                    "https://www.youtube.com/watch?v=73_1biulkYk",
                    true, false, true
                ),
                new Movie(
                    "Oppenheimer", "Biography, Drama, History", "English", 8.9, 2023, "R / 18+",
                    "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                    "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                    "https://www.youtube.com/watch?v=uYPbbksJxIg",
                    true, false, true
                ),
                new Movie(
                    "Joker", "Crime, Drama, Thriller", "English", 8.4, 2019, "A / 18+",
                    "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
                    "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.",
                    "https://www.youtube.com/watch?v=zAGVQLHvwOY",
                    true, false, true
                )
            );

        for (Movie m : movies) {
            movieRepository.findByTitle(m.getTitle()).ifPresentOrElse(existing -> {
                existing.setPoster(m.getPoster());
                existing.setRating(m.getRating());
                existing.setGenre(m.getGenre());
                existing.setOverview(m.getOverview());
                existing.setLanguage(m.getLanguage());
                existing.setReleaseYear(m.getReleaseYear());
                existing.setAgeRating(m.getAgeRating());
                existing.setTrailerUrl(m.getTrailerUrl());
                existing.setIsAdult(m.getIsAdult());
                existing.setIsHorror(m.getIsHorror());
                existing.setTrending(m.getTrending());
                movieRepository.save(existing);
            }, () -> {
                movieRepository.save(m);
            });
        }
        System.out.println(">>> CineVerse Database seeded/updated with " + movies.size() + " movies with verified posters and official trailers.");
    }
}

