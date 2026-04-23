const TarefaRepository = require('../repositories/TarefaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class TarefaController {
  async criar(req, res) {
    try {
      const { titulo, data, prioridade, descricao } = req.body;
      const usuarioId = req.usuarioId;

      if (!titulo || !data) {
        return res.status(400).json({ erro: 'Título e data são obrigatórios' });
      }

      const tarefa = await TarefaRepository.create(usuarioId, titulo, data, prioridade, descricao);
      res.status(201).json(tarefa);
    } catch (erro) {
      console.error("ERRO NO CONTROLLER:", erro);
      res.status(500).json({ erro: 'Erro ao criar tarefa', detalhe: erro.message });
    }
  }

  async listar(req, res) {
    try {
      const usuarioId = req.usuarioId;
      const tarefas = await TarefaRepository.findAllByUser(usuarioId);
      res.json(tarefas);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao listar tarefas' });
    }
  }

  async alternar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuarioId;
      const tarefa = await TarefaRepository.toggleConcluida(id, usuarioId);
      
      if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada' });
      }

      // Sistema de Recompensa: Ganha um pouco de XP ao completar tarefa avulsa
      if (tarefa.concluida) {
        await UsuarioRepository.adicionarXP(usuarioId, 15);
      } else {
        await UsuarioRepository.adicionarXP(usuarioId, -15);
      }

      const usuarioAtualizado = await UsuarioRepository.findById(usuarioId);
      res.json({ tarefa, xp_total: usuarioAtualizado.xp_acumulado });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.usuarioId;
      await TarefaRepository.delete(id, usuarioId);
      res.status(204).send();
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir tarefa' });
    }
  }
}

module.exports = new TarefaController();
