import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ProjectsPageComponent } from './projects-page/projects-page.component';
import { ProjectStatisticalProgressiveOverloadComponent } from './project-statistical-progressive-overload/project-statistical-progressive-overload.component';
import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { ProjectNotFoundComponent } from './project-not-found/project-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    ProjectsPageComponent,
    ProjectStatisticalProgressiveOverloadComponent,
    ProjectOverviewComponent,
    ProjectNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
