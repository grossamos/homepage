import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-overview',
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.css']
})
export class ProjectOverviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  projectLinks = [
    {title:'App development', link:'statistiscal-progressive-overload'},
    {title:'Vim, zsh, etc.', link:'not-found'},
    {title:'Other', link:'not-found'},
  ];

}
