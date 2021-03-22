import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ProjectNotFoundComponent } from './project-not-found/project-not-found.component';
import { ProjectOverviewComponent } from './project-overview/project-overview.component';
import { ProjectStatisticalProgressiveOverloadComponent } from './project-statistical-progressive-overload/project-statistical-progressive-overload.component';
import { ProjectsPageComponent } from './projects-page/projects-page.component';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'projects', component: ProjectsPageComponent, children: [
    {path: 'statistiscal-progressive-overload', component: ProjectStatisticalProgressiveOverloadComponent},
    {path: '', component: ProjectOverviewComponent},
    {path: 'not-found', component: ProjectNotFoundComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
