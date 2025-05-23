import { ShowtimeQuery } from '@showtime-org/network/src/generated'

export type PartialSeat = ShowtimeQuery['showtime']['screen']['seats'][number]

export const groupSeatsByRow = (
  seats: PartialSeat[],
): Record<number, PartialSeat[]> => {
  return seats.reduce(
    (acc: Record<number, PartialSeat[]>, seat: PartialSeat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      acc[seat.row].push(seat)
      return acc
    },
    {},
  )
}

export const random = (arr: string[]) => {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex]
}

export function generateSeatComment({
  allSeats,
  selectedSeats,
}: {
  allSeats: Record<number, PartialSeat[]>
  selectedSeats: PartialSeat[]
}) {
  const numberOfRows = Object.keys(allSeats).length
  const lastRow = numberOfRows
  const firstRow = 1
  const middleRow = Math.ceil(numberOfRows / 2)

  const isCorner = (seat: PartialSeat) => {
    const isFirstOrLastColumn =
      seat.column === 1 || seat.column === allSeats[seat.row].length
    return isFirstOrLastColumn
  }

  const selectedSeatsCount = selectedSeats.length

  if (selectedSeatsCount === 0) {
    return random(seatComments.zero)
  }

  if (selectedSeatsCount === 1) {
    const selectedSeat = selectedSeats[0]

    if (selectedSeat.row === lastRow) {
      return random(seatComments.lastRow)
    } else if (selectedSeat.row === firstRow) {
      return random(seatComments.firstRow)
    } else if (selectedSeat.row === middleRow) {
      return random(seatComments.middle)
    } else if (isCorner(selectedSeat)) {
      return random(seatComments.soloCorner)
    }
  } else if (selectedSeatsCount === 2) {
    const cornerSeats = selectedSeats.filter(isCorner)
    const hasCornerSeats = cornerSeats.length > 0
    const areAdjacent = (seat1: PartialSeat, seat2: PartialSeat) => {
      if (!seat1 || !seat2) {
        return false
      }

      return (
        seat1.row === seat2.row && Math.abs(seat1.column - seat2.column) === 1
      )
    }

    if (
      hasCornerSeats &&
      selectedSeatsCount === 2 &&
      areAdjacent(selectedSeats[0], selectedSeats[1])
    ) {
      return random(seatComments.couplesCorner)
    } else {
      return random(seatComments.two)
    }
  } else if (selectedSeatsCount === 3) {
    return random(seatComments.three)
  } else if (selectedSeatsCount > 3) {
    return random(seatComments.crowd)
  }

  return random(seatComments.default)
}

type SeatCommentKeys =
  | 'lastRow'
  | 'firstRow'
  | 'middle'
  | 'couplesCorner'
  | 'soloCorner'
  | 'default'
  | 'crowd'
  | 'three'
  | 'two'
  | 'zero'

export const seatComments: { [key in SeatCommentKeys]: string[] } = {
  lastRow: [
    'Last row? You must be a fan of the nosebleed section!',
    'In the last row, you can always spot the latecomers!',
    'Last row seats: where you can watch the movie and the audience at the same time!',
    'Enjoy your birds-eye view from the last row!',
    'Sitting in the last row? We hope you brought your telescope!',
    'Last row: perfect for stretching your legs and testing your vision!',
  ],
  firstRow: [
    "First row seats: for those who don't mind looking up!",
    "Sitting in the front row? Don't forget your neck pillow!",
    'First row: where you can count the pixels on the screen!',
    'Front row fan? You must enjoy being up close and personal!',
    'First row seats: best for practicing your head-tilting skills!',
    'The front row: because who needs peripheral vision, right?',
  ],
  middle: [
    'Middle seats: the Goldilocks zone of the cinema!',
    'Sitting in the middle? You must be a fan of balance!',
    'Middle seats: where you can be at the center of the action!',
    'Ah, the middle seats: not too close, not too far, just right!',
    'Welcome to the middle seats, where every scene is in surround sound!',
    'Middle seats: the sweet spot for movie lovers!',
  ],
  couplesCorner: [
    'Corner couple seats: for those who like to be on the edge of their... seats!',
    'Ah, the corner seats! Perfect for secret hand-holding and sneaky popcorn sharing!',
    'Corner seats: where you can enjoy the movie with a side of privacy!',
    'Got the corner seats? Enjoy your own little world within the cinema!',
    'Corner seats: where you can lean in for a whisper without disturbing the neighbors!',
    'Corner seats: for those who prefer to keep their movie experience exclusive!',

    'Ah, corner couple seats! Remember, sharing popcorn can be an intimate experience, but keep it PG in the theater!',
    "Corner lovebirds, enjoy the movie and each other's company, but don't steal the show.",
    "Sitting in the corner, are we? Let's hope the movie is as steamy as your choice of seats!",
    "Love is in the air, but remember: this isn't a drive-in theater. Keep it classy in the corner!",
    'Corner seats for two? Perfect for whispering sweet nothings!',
    'Couples in the corner, make sure your hands are busy with popcorn.',
  ],
  soloCorner: [
    'A single corner seat? Enjoy your quiet escape from the crowd!',
    'Single corner seat: where you can be a movie-watching ninja!',
    'Sitting solo in the corner? The perfect spot to enjoy your popcorn in peace!',
    'Corner seat for one: your own little island of cinematic enjoyment!',
    'One corner seat: perfect for contemplative movie watching!',
    'Solo corner seat: because sometimes, you just need some me-time at the movies!',
  ],
  default: [
    'Enjoy the show, and remember: laughter is the best medicine, but popcorn is a close second!',
    "Sit back, relax, and let the movie magic begin! Just don't forget to turn off your invisibility cloak!",
    'Welcome to the cinema! Where reality takes a break and your imagination runs wild!',
    "Remember, a movie without popcorn is like a day without sunshine. Don't let the clouds roll in!",
    "You're about to embark on a cinematic adventure. Fasten your seatbelts and enjoy the ride!",
    'Lights, camera, action! Time to sit back and let the big screen work its magic!',
    "Cinema rule #1: Never trust a character who says 'I'll be right back.'",
    'Welcome to the cinema, where dreams come true and cell phones should be on silent!',
    'May the cinematic force be with you! Enjoy the movie and keep an eye out for plot twists!',
    "Here's to the heroes, the villains, and the unexpected love stories. Enjoy the show!",
    "You know you're a movie fan when you've memorized the concession stand menu!",
    'Welcome to the movies, where you can escape reality, one popcorn kernel at a time!',
  ],
  crowd: [
    "Looks like someone's bringing the whole party! Save some popcorn for the rest of us!",
    'Wow, rolling deep! Are you guys starting a flash mob during the movie?',
    "Three's a crowd, but four's a party! Enjoy your cinematic fiesta!",
    'The more, the merrier! Just remember to keep the laughter down during the movie.',
    'You must be really popular! Can I join your squad?',
    "With this many seats, you could start your own mini theater! Just don't forget the snacks.",
    'Is this a movie night or a family reunion? Either way, have a blast!',
    "Looks like you're ready for a blockbuster night! Enjoy the show with your crew!",
    "Whoa, that's a lot of seats! Are you sure you didn't accidentally book the entire row?",
    "Gather 'round, cinephiles! There's room for everyone on this movie adventure.",
    "It's a movie marathon extravaganza! Don't forget to stretch during the intermission.",
    "You've got a full house there! Just remember, sharing is caring when it comes to the popcorn.",
  ],
  three: [
    'Three seats? The Goldilocks of moviegoers – not too few, not too many, just right!',
    'Ah, the classic trio! Are you guys recreating the Three Musketeers at the movies?',
    'Three seats for the three best friends that anyone could have! Enjoy the show, amigos!',
    "Did you know that good things come in threes? Clearly, you're onto something here!",
    'Three seats, three different opinions on the movie. Let the post-show debates begin!',
    'A movie with your favorite trio? Sounds like the ultimate triple threat!',
    "Three's company! Just make sure nobody feels like the third wheel during the movie.",
    "Whoever said two's company, three's a crowd clearly never had this much fun at the movies!",
    "You've got the perfect recipe for a movie night: one part you, one part friend, and one part laughter!",
    'Ready for a trifecta of cinematic enjoyment? Buckle up for the ride, folks!',
    "With three seats, you've got a front-row ticket to the best movie debates and discussions.",
    'Three cheers for the perfect movie squad! May your laughter be contagious and your popcorn be buttery.',
  ],
  two: [
    'Ah, a middle-of-the-road kind of moviegoer! You know what they say: the center is where the action is!',
    'Not a fan of the corners, huh? You must love being in the heart of the cinematic experience!',
    "Center seats for a well-balanced movie night – you've got the perfect view and the perfect company!",
    'No corners for you! Your movie-watching experience is all about that front-and-center action!',
    "Staying away from the edges, are we? Can't blame you; the middle is where the magic happens!",
    "Looks like someone's got their eyes on the prize with these prime non-corner seats!",
    "Who needs the corners when you've got the perfect seats right in the thick of things?",
    'The middle of the theater is where the real movie buffs sit. Welcome to the club!',
    "Steering clear of the corners? You're all about that optimal viewing angle, aren't you?",
    'No corners, no problem! Your movie experience is all about being front and center.',
  ],
  zero: [
    "Hmm, having trouble deciding? It's just like picking your favorite ice cream flavor – sometimes it's hard to choose!",
    'Zero seats? Are we planning a movie marathon at home instead? Just kidding, take your time!',
    "No seats selected yet? Maybe you're just waiting for the perfect moment to make your move!",
    "Zero seats, huh? I guess you're just keeping your options open. Smart move!",
    "A little indecisive, are we? Don't worry, we've all been there. The perfect seat is just a click away!",
    "No seats yet? Maybe you're just enjoying the suspense of choosing the perfect spot!",
    "Still thinking? Take your time – we know it's a big decision! After all, it's where you'll be sitting for the next couple of hours!",
    "Can't decide on a seat? It's like a box of chocolates, you never know what you're gonna get!",
    'Zero seats selected? No worries, we all have those days when decision-making is a bit tough. Take a deep breath and dive in!',
    "No seats picked out yet? It's okay, we know that choosing the perfect spot can be a real nail-biter!",
  ],
}