import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header.component';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
inputMail : string ="";
inputPassword : string="";
readonly snackBarDuration : number = 1500;

  constructor(    private movieService: MovieService,
    private _snackBar: MatSnackBar,
    private router: Router

    ) { }

  ngOnInit(): void {
  }
  onPressLogin(){
    if(this.inputMail !="" && this.inputPassword !=""){
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            this.movieService.login({userType: "Employee", mailAdress: this.inputMail, password:this.inputPassword, lastName: "", firstName: ""}).subscribe(
              data => {
                if(data.userType != "NoUserFound"){
                  HeaderComponent.currentUser = data;
                  localStorage.setItem('currentUser', JSON.stringify(data));
                  let currentSnackbar : any = this._snackBar.open("Anmeldung erfolgreich", "Okay")
                  setTimeout(() => {
                    currentSnackbar.dismiss();
                  }, this.snackBarDuration)
                  if(data.userType == "Employee"){
                    this.router.navigate(['emprogram']);
                  }
                  else{
                    this.router.navigate(['dashboard']);
                  }
                }
                else{
                  this._snackBar.open("Kein Account zu den angegebenen Daten gefunden", "Okay")
                }
                resolve(0);
              }
            );
          
        }, 0)
      })
    }
    else{
      this._snackBar.open("Alle Felder müssen ausgefüllt sein", "Okay")
    }
    return;
  }

}
