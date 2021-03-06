import { Injectable } from '@nestjs/common';
import { Repository, Double, createQueryBuilder, getConnection, getRepository, MoreThan, LessThanOrEqual, } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AlunoEntity } from './aluno.entity';
import { AlunoData } from './aluno.data';
import { EnderecoEntity } from '../endereco/endereco.entity';


@Injectable()
export class AlunoService {
    constructor (@InjectRepository(AlunoEntity) private alunoRepository: Repository<AlunoEntity>,
                 @InjectRepository(EnderecoEntity) private enderecoRepository: Repository<EnderecoEntity>   
    ) {} 

    async createAluno(data: AlunoData, cpf : AlunoData["cpf"]){

        const CpfExists = await this.alunoRepository.findOne({ where:{cpf}});
        
        if (!CpfExists) {
            const aluno = await this.alunoRepository.create(data);
            await this.alunoRepository.save(aluno);
            return aluno;
        } 
        else {
            return {cpf : true};
        }
    }

    async updateAluno(id: string, data: Partial <AlunoData> ){
        await this.alunoRepository.update({id}, data);
        return await this.alunoRepository.findOne({id});
    }

    async showOneAluno(id: string){
        return await this.alunoRepository.findOne({where:{id}});
    }

    async showAllAlunos(){
        return await this.alunoRepository.find();
    }

    async showAlunoMedia(){

        //soma das medias 
        const sum = await getRepository(AlunoEntity)
            .createQueryBuilder("user")
            .select("SUM(user.nota)", "sum")
            .getRawOne();

        //quantidade de notas
        const count = await getRepository(AlunoEntity)
            .createQueryBuilder("user")
            .select("COUNT(user.nota)", "count")
            .getRawOne();
        
        let media = sum.sum / count.count

        const alunMaiorMedia = await getRepository(AlunoEntity)
            .createQueryBuilder("user")
            .select("user")
            .where("user.nota > :nota", { nota: media })
            .getRawMany();
        
        return {media, alunMaiorMedia}
    }

     //programar a função 
     //trocar queryBuilder por typeorm normal 
    async showAlunoCriterio(nota: number, criterio : string){
        

        if (criterio == ">"){
            //const ListaAlunos = await getRepository(AlunoEntity)
            //.createQueryBuilder("user")
            //.select("user")
            //.where("user.nota > :nota", { nota: nota })
            // .getRawMany();
            
            const ListaAlunos = await this.alunoRepository.find({ nota: MoreThan(nota)});
            return {ListaAlunos};
        }
        else if (criterio == "<") {
            //const ListaAlunos = await getRepository(AlunoEntity)
            //.createQueryBuilder("user")
            //.select("user")
            //.where("user.nota < :nota", { nota: nota })
            //.getRawMany();
            
            const ListaAlunos = await this.alunoRepository.find({ nota: LessThanOrEqual(nota)});
            return {ListaAlunos};
        } 
        else {
                
            return {criterio : false}
        }

    }

    async showAllEndereco(id:string){
        //let [enderecos, total] = await this.alunoRepository.findAndCount({ relations:['enderecos'], where:{id} });  

        let [enderecos, total] = await this.enderecoRepository.findAndCount({ where:{alunoId : id} });

        return {total, enderecos}
    }


    async deleteAluno(id: string){
        await this.alunoRepository.delete({id});
        return {deleted : true};
    }

}
