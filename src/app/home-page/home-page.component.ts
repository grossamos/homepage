import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor() { }

  nameOfPage: String = 'Amos Groß';
  subTextOne: String = 'Aspiring Developer';

  exploreLinks = [
    {title:'Github', link:'https://github.com/grossamos/'},
    {title:'LinkedIn', link:'https://www.linkedin.com/in/amos-gro%C3%9F-19a7b2198'},
  ];

  ngOnInit(): void {
  }

}
