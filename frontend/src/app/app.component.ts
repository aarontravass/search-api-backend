import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private readonly appService: AppService) {}
  title = 'frontend';
  search_query = '';
  result: Record<string, any> = {};
  async ngOnInit() {
    console.log(this.search_query)
    this.result = await this.appService
      .search(this.search_query)
      
  }
}
