import { Routes } from '@angular/router';
import { HomepageComponent } from '../components/homepage/homepage.component';

export const routes: Routes = [
    {path:'',redirectTo:'Homepage',pathMatch:'full'},
    {path:'Homepage',component:HomepageComponent},
    {path:'**',redirectTo:'Homepage',pathMatch:'full'}
];
