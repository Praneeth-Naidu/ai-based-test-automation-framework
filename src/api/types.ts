// --- Conduit (RealWorld) ---

export interface ConduitUser {
  username: string;
  email: string;
  password: string;
}

export interface ConduitAuthResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string | null;
    image: string | null;
  };
}

export interface ConduitArticleInput {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface ConduitArticleResponse {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    author: { username: string };
  };
}

// --- restful-booker ---

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string; // YYYY-MM-DD
    checkout: string;
  };
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}
