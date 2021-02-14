import { Component, OnInit } from '@angular/core';

import { Faq } from './../../shared/models/faq.model';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
})
export class FaqComponent implements OnInit {
  faqs: Array<Faq> = [
    {
      title: '¿Cómo pedir una cita?',
      text:
        'Para reservar una cita haz click/tap sobre la hora inicial durante un segundo o hasta que veas colorearse el recuadro, acto seguido desplaza el ratón y suelta el click/tap en la hora fin de la cita.',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
