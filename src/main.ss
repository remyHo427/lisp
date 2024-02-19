(define member?
    (lambda (a lat)
        (if (null? lat)
            #f
            (if (eq? (car lat) a)
                #t
                (member? a (cdr lat))))))