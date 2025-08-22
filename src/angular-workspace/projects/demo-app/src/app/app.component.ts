import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularUiComponent } from '../../../angular-ui/src/public-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AngularUiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo-app';
}
