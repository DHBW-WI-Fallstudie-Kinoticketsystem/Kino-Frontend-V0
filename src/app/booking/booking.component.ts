import { Component, OnInit } from '@angular/core';

import { SeatInEvent } from '../seatInEvent';
import { MovieEvent } from '../MovieEvent';
import { SEATS } from '../mock-seats';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MovieService } from '../movie.service';

import { Booking } from '../booking';
import { BookingCreation } from '../bookingCreation';

import { Ticket } from '../ticket';
import { HeaderComponent } from '../header/header.component';
import { User } from '../user';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  user:User ={userType: "",
  mailAdress: "",
  password: "",
  lastName: "",
  firstName: ""};

  tickets: Ticket[] = [];
  ticketsByRow : Ticket [][] = [];

  selectedTickets: Ticket[] = [];
  priceSum: number = 0;

  bookingToConfirm: Booking | undefined;

  exampleFree: Ticket = {
    id: 0,
    row: "A",
    numberInRow: 0,
    status: 0,
    defaultPrice: 0
  };

  exampleOccupied: Ticket = {
    id: 0,
    row: "A",
    numberInRow: 0,
    status: 1,
    defaultPrice: 0
  };

  exampleBlocked: Ticket = {
    id: 0,
    row: "A",
    numberInRow: 0,
    status: 2,
    defaultPrice: 0
  };

  exampleSelected: Ticket = {
    id: 0,
    row: "A",
    numberInRow: 0,
    status: 3,
    defaultPrice: 0
  };

  seats: SeatInEvent[][] = SEATS;
  eventId: number = 1;
  movieEvent: MovieEvent | undefined;
  
  statusChangeSuccessfull: boolean = false;

  bookingSuccessfull: boolean = false;

  seatsInEvent :SeatInEvent[] = [];

  selectedSeats: SeatInEvent[] = [];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.user = HeaderComponent.currentUser;
    this.loadData();
  }

  async loadData(){
    this.getMovieEvent();
    await this.getTickets();
    this.splitTicketsByRow();
  }

  getMovieEvent(){
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.movieService.getEventById(id).subscribe(data => {
      this.movieEvent = data;
    })
  }


  getTickets(){
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const id = Number(this.route.snapshot.paramMap.get('id'))
        this.movieService.getTicketsInEventId(id).subscribe(data =>{
          this.tickets = data;
          resolve(0);
        });
      }, 0)
    })
  }

  splitTicketsByRow(){
    this.ticketsByRow = [];
    let tempArray: Ticket[] = [];

    this.tickets.forEach(ticket => {
      if(this.selectedTickets.filter(t => t.id == ticket.id).length > 0){
        ticket.status = 3;
      }

      if(tempArray.length > 0){
        if(tempArray[0].row == ticket.row){
          tempArray.push(ticket);
        }else{
          this.ticketsByRow.push(tempArray);
          tempArray = [];
          tempArray.push(ticket);
        }
      }else{
        tempArray.push(ticket);
      }
    })

    if(tempArray.length > 0){
      this.ticketsByRow.push(tempArray);
    }
  }


  clearSelectedSeats(){
    this.selectedSeats.forEach(seat => {
      this.movieService.setSeatInEventStatus({row: seat.row,
        numberInRow: seat.numberInRow, status: 0, seatId: seat.seatId, eventId: seat.eventId}).subscribe(
        data => {
          this.statusChangeSuccessfull = data;
        }
      );
    })

    window.location.reload();
  }


  async bookSeatsClicked(){
    if(this.selectedTickets.length == 0){
      return;
    }

    await this.createBooking();

    this.bookingToConfirm = {id: 0, eventId: this.eventId, tickets: this.selectedTickets};
    this.selectedTickets = [];
    
    this.loadData();
  }

  createBooking(){
    if(this.selectedTickets.length == 0){
      return;
    }
    
    let ticketIds: number[] = [];

    this.selectedTickets.forEach(ticket => {
      ticketIds.push(ticket.id);
    })

    let bookingCreation: BookingCreation = {email: HeaderComponent.currentUser.mailAdress, ticketIds: ticketIds};

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.movieService.newBooking(bookingCreation).subscribe(
          data => {
            
            this.statusChangeSuccessfull = data;
            resolve(0);
          }
        );
      }, 0)
    })

  }

  async ticketClicked(ticket: Ticket){
    if(ticket.status == 3){
      for(let i = 0; i < this.selectedTickets.length; i++){
        if(this.selectedTickets[i].id == ticket.id){
          this.selectedTickets.splice(i, 1);
          await this.changeTicketStatus(ticket, 0);
          break;
        }
      }

      this.selectedTickets.forEach((t, index) => {
        
      })
    }else if(ticket.status == 0){
      await this.changeTicketStatus(ticket, 2);
      this.selectedTickets.push(ticket);
    }
    this.loadData();

    this.priceSum = 0;
    this.selectedTickets.forEach(ticket => {
      this.priceSum += ticket.defaultPrice;
    })
  }

  changeTicketStatus(ticket: Ticket, status: number){
    let statusChange = {id: ticket.id, status: status};

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.movieService.setStatusForTicket(statusChange).subscribe(
          data => {
            this.statusChangeSuccessfull = data;
            resolve(0);
          }
        );
      }, 0)
    })
  }

}
