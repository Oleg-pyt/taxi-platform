import { Component, AfterViewInit } from '@angular/core';
import SwaggerUI from 'swagger-ui';

@Component({
  selector: 'app-swagger',
  template: '<div id="swagger-ui"></div>'
})
export class SwaggerComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    SwaggerUI({
      dom_id: '#swagger-ui',
      url: 'http://localhost:8080/v3/api-docs', // Swagger endpoint backend
    });
  }
}
